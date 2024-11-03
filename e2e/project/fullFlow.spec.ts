import { Page } from "@playwright/test";

import { expect, test } from "../fixtures";
import { waitForToast } from "../utils";

async function readClipboardText(page: Page) {
	// For Firefox, we need to use a different approach using keyboard shortcuts
	const isFirefox = page?.context()?.browser()?.browserType().name() === "firefox";

	if (isFirefox) {
		// Create a temporary input element
		await page.evaluate(() => {
			const textarea = document.createElement("textarea");
			textarea.id = "clipboard-textarea";
			document.body.appendChild(textarea);
		});

		// Focus the textarea
		await page.focus("#clipboard-textarea");

		// Use keyboard shortcut to paste (Ctrl+V or Command+V)
		if (process.platform === "darwin") {
			await page.keyboard.press("Meta+V");
		} else {
			await page.keyboard.press("Control+V");
		}

		// Get the pasted content
		const clipboardText = await page.$eval(
			"#clipboard-textarea",
			(element) => (element as HTMLTextAreaElement).value
		);

		// Clean up
		await page.evaluate(() => {
			const textarea = document.getElementById("clipboard-textarea");
			if (textarea) {
				document.body.removeChild(textarea);
			}
		});

		return clipboardText;
	} else {
		// For other browsers, use the Clipboard API
		return await page.evaluate(async () => {
			try {
				const permission = await navigator.permissions.query({ name: "clipboard-read" as PermissionName });
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
	}
}

async function waitForDeploymentCompletion(page: Page, timeoutMs = 30000) {
	// Use expect with polling to check for completion
	await expect(async () => {
		// Get the refresh button
		const refreshButton = page.getByRole("button", { name: "Refresh" });

		// Check if button is not disabled
		const isDisabled = await refreshButton.evaluate((element) => (element as HTMLButtonElement).disabled);

		if (!isDisabled) {
			// Click the refresh button if it's not disabled
			await refreshButton.click();
		}

		// Check if the status element is visible and contains "1"
		const hasCompletedStatus = await page
			.getByRole("status", { name: "completed" })
			.filter({ hasText: "1" })
			.isVisible();

		// This will throw if condition is not met, causing the expect to retry
		expect(hasCompletedStatus).toBe(true);
	}).toPass({
		timeout: timeoutMs,
		intervals: [1000],
	});
}

test.beforeEach(async ({ dashboardPage, page, request }) => {
	await dashboardPage.createProjectFromTemplate();

	const deployButton = page.getByRole("button", { name: "Deploy project" });
	await deployButton.click();
	const toast = await waitForToast(page, "Project deployment completed successfully");
	await expect(toast).toBeVisible();
	await page.getByRole("tab", { name: "Triggers" }).click();
	await page.getByRole("button", { name: "Modify receive_http_get_or_head trigger" }).click();
	await page.getByRole("button", { name: "Copy Webhook URL" }).click();

	await page.waitForTimeout(500);

	const clipboardText = await readClipboardText(page);

	if (!clipboardText) {
		throw new Error("Failed to read clipboard text");
	}

	try {
		const response = await request.get(clipboardText, {
			timeout: 5000,
		});

		if (!response.ok()) {
			throw new Error(`Request failed with status ${response.status()}`);
		}
	} catch (error) {
		console.error("Request failed:", error);
		throw error;
	}

	await page.getByRole("button", { name: "Deployments" }).click();
	await expect(page.getByRole("heading", { name: "Deployment History (1)" })).toBeVisible();
	await expect(page.getByRole("status", { name: "Active" })).toBeVisible();
	const deploymentTableRow = page.getByRole("cell", { name: /bld_*/ });
	await expect(deploymentTableRow).toHaveCount(1);

	await waitForDeploymentCompletion(page);
});

test.describe("Full flow Suite", () => {
	test("Create project from template and run a session", async ({ page }) => {
		const deploymentTableRow = page.getByRole("cell", { name: /bld_*/ });

		await expect(deploymentTableRow).toHaveCount(1);
	});
});
