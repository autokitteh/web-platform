import type { APIRequestContext, Page } from "@playwright/test";
import randomatic from "randomatic";

import { expect, test } from "../fixtures";
import { waitForToast } from "../utils";
import { DashboardPage, ProjectPage } from "e2e/pages";
import { waitForLoadingOverlayGone } from "e2e/utils/waitForLoadingOverlayToDisappear";

interface SetupParams {
	dashboardPage: DashboardPage;
	page: Page;
	request: APIRequestContext;
}

const projectName = `test_${randomatic("Aa", 4)}`;

async function waitForFirstCompletedSession(page: Page, timeoutMs = 120000) {
	await expect(async () => {
		const refreshButton = page.locator('button[aria-label="Refresh"]');
		const isDisabled = await refreshButton.evaluate((element) => (element as HTMLButtonElement).disabled);

		if (!isDisabled) {
			await refreshButton.click();
		}

		const completedSession = await page.getByRole("button", { name: "1 Completed" }).isVisible();

		expect(completedSession).toBe(true);

		return true;
	}).toPass({
		timeout: timeoutMs,
		intervals: [3000],
	});
}

test.describe("Session triggered with webhook", () => {
	test.beforeEach(async ({ dashboardPage, page, request }: SetupParams) => {
		await setupProjectAndTriggerSession({ dashboardPage, page, request });
	});

	test("Deploy project and execute session via webhook", async ({
		page,
		projectPage,
	}: {
		page: Page;
		projectPage: ProjectPage;
	}) => {
		test.setTimeout(5 * 60 * 1000); // 5 minutes

		const completedSessionDeploymentColumn = page.getByRole("button", { name: "1 Completed" });
		await expect(completedSessionDeploymentColumn).toBeVisible();
		await expect(completedSessionDeploymentColumn).toBeEnabled();
		await completedSessionDeploymentColumn.click();

		const sessionCompletedLog = page.getByText("The session has finished with completed state");
		await expect(sessionCompletedLog).toBeVisible();

		await projectPage.stopDeployment();
		await projectPage.deleteProject(projectName);
	});
});

async function setupProjectAndTriggerSession({ dashboardPage, page, request }: SetupParams) {
	await page.goto("/");

	await page.getByRole("heading", { name: /^Welcome to .+$/, level: 1 }).isVisible();

	try {
		await page.locator('button[aria-label="Start From Template"]').click({ timeout: 3000 });

		await expect(page.getByText("Start From Template")).toBeVisible();

		await page.getByLabel("Categories").click();
		await page.getByRole("option", { name: "Samples" }).click();
		await page.locator("body").click({ position: { x: 0, y: 0 } });
		await page.locator('button[aria-label="Create Project From Template: HTTP"]').scrollIntoViewIfNeeded();
		await page.locator('button[aria-label="Create Project From Template: HTTP"]').click({ timeout: 2000 });

		await page.getByPlaceholder("Enter project name").fill(projectName);
		await page.locator('button[aria-label="Create"]').click();
		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		await dashboardPage.createProjectFromTemplate(projectName);
	}

	await waitForLoadingOverlayGone(page);
	await page.locator('button[aria-label="Open Triggers Section"]').click();
	await expect(page.getByText("receive_http_get_or_head")).toBeVisible();
	await expect(page.locator(`button[aria-label='Trigger information for "receive_http_get_or_head"']`)).toBeVisible();
	await page.locator(`button[aria-label='Trigger information for "receive_http_get_or_head"']`).hover();

	await expect(page.getByText("webhooks.py")).toBeVisible();
	const copyButton = await page.waitForSelector('[data-testid="copy-receive_http_get_or_head-webhook-url"]');
	const webhookUrl = await copyButton.getAttribute("value");

	if (!webhookUrl) {
		throw new Error("Failed to get webhook URL from button value attribute");
	}

	await page.locator('button[aria-label="Deploy project"]').click();

	const toast = await waitForToast(page, "Project deployment completed successfully");
	await expect(toast).toBeVisible();

	const response = await request.get(webhookUrl, {
		timeout: 5000,
	});

	if (!response.ok()) {
		throw new Error(`Webhook request failed with status ${response.status()}`);
	}

	await page.locator('button[aria-label="Deployments"]').click();
	await expect(page.getByText("Deployment History")).toBeVisible();

	await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();
	await page.locator('button[aria-label="Close Project Settings"]').click();

	await expect(page.getByText("Active").first()).toBeVisible();
	const deploymentId = page.getByText(/bld_*/);
	await expect(deploymentId).toBeVisible();

	await waitForFirstCompletedSession(page);
}
