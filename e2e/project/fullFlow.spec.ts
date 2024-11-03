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
		// Try Clipboard API first for Chromium
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

		// For Safari/WebKit, use a more robust approach
		await page.evaluate(() => {
			const textarea = document.createElement("textarea");
			textarea.id = "clipboard-textarea";
			// Make the textarea visible and more accessible for Safari
			textarea.style.position = "fixed";
			textarea.style.top = "0";
			textarea.style.left = "0";
			textarea.style.width = "100px"; // Increased size for better interaction
			textarea.style.height = "100px"; // Increased size for better interaction
			textarea.style.opacity = "1"; // Make it visible for debugging
			textarea.style.padding = "10px";
			textarea.style.zIndex = "999999";
			document.body.appendChild(textarea);
		});

		if (browserType === "webkit") {
			// Add extra steps for Safari
			await page.waitForTimeout(500);

			// Ensure the textarea is focused
			await page.click("#clipboard-textarea");

			// Try multiple times to ensure the paste command is received
			for (let i = 0; i < 3; i++) {
				await page.keyboard.press(process.platform === "darwin" ? "Meta+V" : "Control+V");
				await page.waitForTimeout(500);

				// Check if we got content
				const content = await page.$eval(
					"#clipboard-textarea",
					(element) => (element as HTMLTextAreaElement).value
				);

				if (content) {
					// Clean up
					await page.evaluate(() => document.getElementById("clipboard-textarea")?.remove());

					return content;
				}

				// If no content, wait a bit before trying again
				await page.waitForTimeout(500);
			}

			throw new Error("Failed to paste content after multiple attempts");
		}

		// For other browsers
		await page.focus("#clipboard-textarea");
		await page.keyboard.press(process.platform === "darwin" ? "Meta+V" : "Control+V");
		await page.waitForTimeout(500);

		const content = await page.$eval("#clipboard-textarea", (element) => (element as HTMLTextAreaElement).value);

		// Clean up
		await page.evaluate(() => document.getElementById("clipboard-textarea")?.remove());

		if (!content) {
			throw new Error("No content found in textarea after paste operation");
		}

		return content;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error(`Clipboard operation failed in ${browserType}:`, errorMessage);

		// Take a screenshot for debugging if the operation fails
		await page.screenshot({
			path: `clipboard-operation-failed-${browserType}-${Date.now()}.png`,
		});

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
