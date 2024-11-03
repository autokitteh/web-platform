/* eslint-disable no-console */
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
		if (browserType === "chromium") {
			const clipboardText = await page.evaluate(async () => {
				try {
					return await navigator.clipboard.readText();
				} catch (error) {
					console.error("Failed to read clipboard:", error);

					return null;
				}
			});

			if (!clipboardText) {
				throw new Error("Clipboard API returned empty content");
			}

			return clipboardText;
		}

		await page.evaluate(() => {
			const element = document.createElement("textarea");
			element.id = "clipboard-textarea";
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

		if (browserType === "webkit") {
			await page.waitForTimeout(1000);
			await page.$eval("#clipboard-textarea", (element) => element.focus());
		}

		await page.focus("#clipboard-textarea");
		await page.keyboard.press(process.platform === "darwin" ? "Meta+V" : "Control+V");
		await page.waitForTimeout(browserType === "webkit" ? 1000 : 500);

		const content = await page.$eval("#clipboard-textarea", (element) => (element as HTMLTextAreaElement).value);

		await page.evaluate(() => document.getElementById("clipboard-textarea")?.remove());

		if (!content) {
			throw new Error("No content found in textarea after paste operation");
		}

		return content;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error(`Clipboard operation failed in ${browserType}:`, errorMessage);

		return null;
	}
}

async function waitForDeploymentStatus(page: Page, timeoutMs = 60000) {
	let lastStatus: string | undefined = undefined;
	let attempts = 0;

	await expect(async () => {
		attempts++;
		const refreshButton = page.getByRole("button", { name: "Refresh" });

		console.log(`Checking deployment status - attempt ${attempts}`);

		try {
			const isDisabled = await refreshButton.evaluate((element) => (element as HTMLButtonElement).disabled);

			if (!isDisabled) {
				console.log("Clicking refresh button");
				await refreshButton.click();
				await page.waitForTimeout(500);
			}

			const statusElement = page.getByRole("status", { name: "completed" });
			const isVisible = await statusElement.isVisible();
			const text = isVisible ? (await statusElement.textContent()) || "no text" : "not visible";

			if (text !== lastStatus) {
				console.log(`Current status: ${text}`);
				lastStatus = text;
			}

			const hasCompletedStatus = await page
				.getByRole("status", { name: "completed" })
				.filter({ hasText: "1" })
				.isVisible();

			expect(hasCompletedStatus).toBe(true);

			console.log("Deployment completed successfully");

			return true;
		} catch (error) {
			await page.screenshot({ path: `deployment-status-attempt-${attempts}.png` });
			throw error;
		}
	}).toPass({
		timeout: timeoutMs,
		intervals: [2000],
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

	await page.getByRole("tab", { name: "Triggers" }).click();
	await page.getByRole("button", { name: "Modify receive_http_get_or_head trigger" }).click();

	const copyButton = page.getByRole("button", { name: "Copy Webhook URL" });
	await copyButton.waitFor({ state: "visible" });
	await copyButton.click();

	const browserType = page?.context()?.browser()?.browserType().name();
	await page.waitForTimeout(browserType === "webkit" ? 1500 : 500);

	const webhookUrl = await getClipboardContent(page);

	if (!webhookUrl) {
		throw new Error(
			`Failed to get webhook URL from clipboard in ${browserType} browser. ` +
				`Make sure the URL was copied correctly and clipboard permissions are granted.`
		);
	}

	console.log("Making webhook request...");
	try {
		const response = await request.get(webhookUrl, {
			timeout: 10000,
		});

		if (!response.ok()) {
			throw new Error(`Webhook request failed with status ${response.status()}`);
		}
		console.log("Webhook request successful");
	} catch (error) {
		console.error("Webhook request failed:", error);
		throw error;
	}

	await page.getByRole("button", { name: "Deployments" }).click();
	await expect(page.getByRole("heading", { name: "Deployment History (1)" })).toBeVisible();

	await expect(page.getByRole("status", { name: "Active" })).toBeVisible();
	const deploymentTableRow = page.getByRole("cell", { name: /bld_*/ });
	await expect(deploymentTableRow).toHaveCount(1);

	console.log("Waiting for deployment to complete...");
	await waitForDeploymentStatus(page);
	console.log("Deployment status check completed");
}
