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
	const isFirefox = browserType === "firefox";
	const isSafari = browserType === "webkit";

	if (isFirefox || isSafari) {
		try {
			await page.evaluate(() => {
				const textarea = document.createElement("textarea");
				textarea.id = "clipboard-textarea";
				textarea.style.position = "fixed";
				textarea.style.top = "0";
				textarea.style.left = "0";
				textarea.style.opacity = "1";
				document.body.appendChild(textarea);
			});

			await page.focus("#clipboard-textarea");

			if (process.platform === "darwin") {
				await page.keyboard.press("Meta+V");
			} else {
				await page.keyboard.press("Control+V");
			}

			if (isSafari) {
				await page.waitForTimeout(100);
			}

			const clipboardText = await page.$eval(
				"#clipboard-textarea",
				(element) => (element as HTMLTextAreaElement).value
			);

			await page.evaluate(() => {
				const textarea = document.getElementById("clipboard-textarea");
				if (textarea) {
					document.body.removeChild(textarea);
				}
			});

			if (!clipboardText) {
				console.warn(`No clipboard content found in ${browserType}`);
			}

			return clipboardText;
		} catch (error) {
			console.error(`Error reading clipboard in ${browserType}:`, error);

			return null;
		}
	} else {
		try {
			return await page.evaluate(async () => {
				try {
					const permission = await navigator.permissions.query({
						name: "clipboard-read" as PermissionName,
					});

					if (permission.state === "granted" || permission.state === "prompt") {
						return await navigator.clipboard.readText();
					} else {
						throw new Error("Clipboard permission denied");
					}
				} catch (error) {
					console.error("Failed to read clipboard:", error);

					return null;
				}
			});
		} catch (error) {
			console.error("Clipboard API error:", error);

			return null;
		}
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
