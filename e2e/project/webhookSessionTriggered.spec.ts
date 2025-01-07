import { APIRequestContext, Page } from "@playwright/test";
import randomatic from "randomatic";

import { expect, test } from "../fixtures";
import { waitForToast } from "../utils";
import { DashboardPage, ProjectPage } from "e2e/pages";

interface SetupParams {
	dashboardPage: DashboardPage;
	page: Page;
	request: APIRequestContext;
}

const projectName = `test_${randomatic("Aa", 4)}`;

async function waitForFirstCompletedSession(page: Page, timeoutMs = 60000) {
	await expect(async () => {
		const refreshButton = page.getByRole("button", { name: "Refresh" });
		const isDisabled = await refreshButton.evaluate((element) => (element as HTMLButtonElement).disabled);

		if (!isDisabled) {
			await refreshButton.click();
			await page.waitForTimeout(500);
		}

		const completedSession = await page.getByRole("button", { name: "1 completed" }).isVisible();

		expect(completedSession).toBe(true);

		return true;
	}).toPass({
		timeout: timeoutMs,
		intervals: [2000],
	});
}

test.describe("Session triggered with webhook", () => {
	test.beforeEach(async ({ dashboardPage, page, request }: SetupParams) => {
		await setupProjectAndTriggerSession({ dashboardPage, page, request });
	});

	test("should successfully deploy project and execute session via webhook", async ({
		page,
		projectPage,
	}: {
		page: Page;
		projectPage: ProjectPage;
	}) => {
		const completedSessionDeploymentColumn = page.getByRole("button", { name: "1 completed" });
		await completedSessionDeploymentColumn.click();

		await page
			.locator("role=row", {
				has: page.getByRole("cell", { name: "receive_http_get_or_head" }),
			})
			.click();

		const sessionCompletedLog = page.getByText("The session has finished with completed state");
		await expect(sessionCompletedLog).toBeVisible();

		await projectPage.stopDeployment();
		await projectPage.deleteProject(projectName);
	});
});

async function setupProjectAndTriggerSession({ dashboardPage, page, request }: SetupParams) {
	await dashboardPage.createProjectFromTemplate(projectName);

	await expect(page.getByText("webhooks.py")).toBeVisible();

	const deployButton = page.getByRole("button", { name: "Deploy project" });
	await deployButton.click();
	const toast = await waitForToast(page, "Project deployment completed successfully");
	await expect(toast).toBeVisible();

	await page.getByRole("tab", { name: "Triggers" }).click();
	await page.getByRole("button", { name: "Modify receive_http_get_or_head trigger" }).click();

	await expect(page.getByText("Changes might affect the currently running deployments.")).toBeVisible();
	await page.getByRole("button", { name: "Ok" }).click();

	await page.waitForSelector('[data-testid="webhook-url"]');

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

	const response = await request.get(webhookUrl, {
		timeout: 5000,
	});

	if (!response.ok()) {
		throw new Error(`Webhook request failed with status ${response.status()}`);
	}

	await page.getByRole("button", { name: "Deployments" }).click();
	await expect(page.getByRole("heading", { name: "Deployment History (1)" })).toBeVisible();

	await expect(page.getByRole("status", { name: "Active" })).toBeVisible();
	const deploymentTableRow = page.getByRole("cell", { name: /bld_*/ });
	await expect(deploymentTableRow).toHaveCount(1);

	await waitForFirstCompletedSession(page);
}
