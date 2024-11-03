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
		// For Chrome/Edge (Chromium-based browsers), use the Clipboard API directly
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

		// For Firefox and Safari
		// Create textarea with specific styling for Safari
		await page.evaluate(() => {
			const element = document.createElement("textarea");
			element.id = "clipboard-textarea";
			// Safari-specific styling to ensure visibility and focus
			element.style.position = "fixed";
			element.style.top = "0";
			element.style.left = "0";
			element.style.width = "2em";
			element.style.height = "2em";
			element.style.padding = "0";
			element.style.border = "none";
			element.style.outline = "none";
			element.style.boxShadow = "none";
			element.style.background = "transparent";
			document.body.appendChild(element);
		});

		// For Safari, we need more explicit focus handling
		if (browserType === "webkit") {
			await page.waitForTimeout(1000); // Longer wait for Safari
			await page.$eval("#clipboard-textarea", (element) => element.focus());
		}

		await page.focus("#clipboard-textarea");

		// Press paste command with retry for Safari
		if (browserType === "webkit") {
			for (let i = 0; i < 3; i++) {
				// Try up to 3 times
				await page.keyboard.press(process.platform === "darwin" ? "Meta+V" : "Control+V");
				await page.waitForTimeout(500);

				const content = await page.$eval(
					"#clipboard-textarea",
					(element) => (element as HTMLTextAreaElement).value
				);

				if (content) {
					// Clean up
					await page.evaluate(() => document.getElementById("clipboard-textarea")?.remove());

					return content;
				}

				// Wait before retry
				await page.waitForTimeout(500);
			}
			throw new Error("Failed to paste content after multiple attempts");
		} else {
			// Firefox and other browsers
			await page.keyboard.press(process.platform === "darwin" ? "Meta+V" : "Control+V");
			const content = await page.$eval(
				"#clipboard-textarea",
				(element) => (element as HTMLTextAreaElement).value
			);

			// Clean up
			await page.evaluate(() => document.getElementById("clipboard-textarea")?.remove());

			return content;
		}
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

	const browserType = page?.context()?.browser()?.browserType().name();
	if (browserType === "webkit") {
		await page.waitForTimeout(1500); // Longer initial wait for Safari
	} else {
		await page.waitForTimeout(500);
	}

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
