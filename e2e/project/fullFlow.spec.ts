import { APIRequestContext, Page } from "@playwright/test";

import { expect, test } from "../fixtures";
import { waitForToast } from "../utils";
import { DashboardPage } from "e2e/pages";

interface SetupParams {
	dashboardPage: DashboardPage;
	page: Page;
	request: APIRequestContext;
}

async function waitForDeploymentStatus(page: Page, timeoutMs = 60000) {
	let lastStatus: string | undefined = undefined;

	await expect(async () => {
		const refreshButton = page.getByRole("button", { name: "Refresh" });
		const isDisabled = await refreshButton.evaluate((element) => (element as HTMLButtonElement).disabled);

		if (!isDisabled) {
			await refreshButton.click();
			await page.waitForTimeout(500);
		}

		const statusElement = page.getByRole("status", { name: "completed" });
		const isVisible = await statusElement.isVisible();
		const text = isVisible ? (await statusElement.textContent()) || "no text" : "not visible";

		if (text !== lastStatus) {
			lastStatus = text;
		}

		const hasCompletedStatus = await page
			.getByRole("status", { name: "completed" })
			.filter({ hasText: "1" })
			.isVisible();

		expect(hasCompletedStatus).toBe(true);

		return true;
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

async function getWebhookUrl(page: Page): Promise<string> {
	const webhookUrl = await page.evaluate(() => {
		const urlElement = document.querySelector('[data-testid="webhook-url"]');

		if (!urlElement) {
			throw new Error("Could not find webhook URL element");
		}

		return (urlElement as HTMLInputElement).value || urlElement.textContent;
	});

	if (!webhookUrl) {
		throw new Error("Failed to get webhook URL from the page");
	}

	return webhookUrl;
}

async function setupProjectAndTriggerSession({ dashboardPage, page, request }: SetupParams) {
	await dashboardPage.createProjectFromTemplate();

	const deployButton = page.getByRole("button", { name: "Deploy project" });
	await deployButton.click();
	const toast = await waitForToast(page, "Project deployment completed successfully");
	await expect(toast).toBeVisible();

	await page.getByRole("tab", { name: "Triggers" }).click();
	await page.getByRole("button", { name: "Modify receive_http_get_or_head trigger" }).click();

	await page.waitForSelector('[data-testid="webhook-url"]');

	const webhookUrl = await getWebhookUrl(page);

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
