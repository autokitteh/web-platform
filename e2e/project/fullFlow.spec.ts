import { APIRequestContext, Page } from "@playwright/test";

import { expect, test } from "../fixtures";
import { waitForToast } from "../utils";
import { DashboardPage } from "e2e/pages";

interface SetupParams {
	dashboardPage: DashboardPage;
	page: Page;
	request: APIRequestContext;
}

async function getClipboardContent(page: Page): Promise<string | null> {
	const browserType = page?.context()?.browser()?.browserType().name();

	try {
		// For Chrome/Chromium, we can use the Clipboard API directly
		if (browserType === "chromium") {
			return await page.evaluate(async () => {
				try {
					return await navigator.clipboard.readText();
				} catch (error) {
					console.error("Failed to read clipboard:", error);

					return null;
				}
			});
		}

		// For Firefox and Safari, still use the textarea approach as it's more reliable
		await page.evaluate(() => {
			const element = document.createElement("textarea");
			element.id = "clipboard-textarea";
			document.body.appendChild(element);

			return element.id;
		});

		await page.focus("#clipboard-textarea");
		await page.keyboard.press(process.platform === "darwin" ? "Meta+V" : "Control+V");

		// Get content and cleanup
		const content = await page.$eval("#clipboard-textarea", (element) => (element as HTMLTextAreaElement).value);
		await page.evaluate(() => document.getElementById("clipboard-textarea")?.remove());

		return content;
	} catch (error) {
		console.error(`Clipboard operation failed in ${browserType}:`, error);

		return null;
	}
}

async function waitForDeploymentStatus(page: Page, timeoutMs = 30000) {
	await expect(async () => {
		const refreshButton = page.getByRole("button", { name: "Refresh" });

		const isDisabled = await refreshButton.evaluate((element) => (element as HTMLButtonElement).disabled);

		if (!isDisabled) {
			await refreshButton.click();
		}

		const hasCompletedStatus = await page
			.getByRole("status", { name: "completed" })
			.filter({ hasText: "1" })
			.isVisible();

		expect(hasCompletedStatus).toBe(true);
	}).toPass({
		timeout: timeoutMs,
		intervals: [1000],
	});
}

test.describe("Project Deployment and Session Flow", () => {
	test.beforeEach(async ({ dashboardPage, page, request }: SetupParams) => {
		await setupProjectAndTriggerSession({ dashboardPage, page, request });
	});

	test("should successfully deploy project and execute session via webhook", async ({ page }: { page: Page }) => {
		const deploymentTableRow = page.getByRole("cell", { name: /bld_*/ });
		await expect(deploymentTableRow).toHaveCount(1);
	});
});

async function setupProjectAndTriggerSession({ dashboardPage, page, request }: SetupParams) {
	await dashboardPage.createProjectFromTemplate();

	const deployButton = page.getByRole("button", { name: "Deploy project" });
	await deployButton.click();
	const toast = await waitForToast(page, "Project deployment completed successfully");
	await expect(toast).toBeVisible();

	// Setup webhook trigger
	await page.getByRole("tab", { name: "Triggers" }).click();
	await page.getByRole("button", { name: "Modify receive_http_get_or_head trigger" }).click();
	await page.getByRole("button", { name: "Copy Webhook URL" }).click();

	await page.waitForTimeout(500);

	const webhookUrl = await getClipboardContent(page);

	if (!webhookUrl) {
		throw new Error("Failed to get webhook URL from clipboard");
	}

	try {
		const response = await request.get(webhookUrl, {
			timeout: 5000,
		});

		if (!response.ok()) {
			throw new Error(`Webhook request failed with status ${response.status()}`);
		}
	} catch (error) {
		console.error("Webhook request failed:", error);
		throw error;
	}

	await page.getByRole("button", { name: "Deployments" }).click();
	await expect(page.getByRole("heading", { name: "Deployment History (1)" })).toBeVisible();
	await expect(page.getByRole("status", { name: "Active" })).toBeVisible();
	const deploymentTableRow = page.getByRole("cell", { name: /bld_*/ });
	await expect(deploymentTableRow).toHaveCount(1);

	await waitForDeploymentStatus(page);
}
