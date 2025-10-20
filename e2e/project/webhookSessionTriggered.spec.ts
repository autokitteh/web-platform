import type { APIRequestContext, Page } from "@playwright/test";
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
		test.setTimeout(5 * 60 * 1000); // 5 minutes

		const completedSessionDeploymentColumn = page.getByRole("button", { name: "1 completed" });
		await expect(completedSessionDeploymentColumn).toBeVisible();
		await expect(completedSessionDeploymentColumn).toBeEnabled();
		await completedSessionDeploymentColumn.click();

		await page.waitForLoadState("networkidle");

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
		await page.getByRole("button", { name: "Start From Template" }).click({ timeout: 8000 });

		await expect(page.getByText("Start From Template")).toBeVisible();

		await page.getByLabel("Categories").click();
		await page.getByRole("option", { name: /Samples/ }).click();
		await page.locator("body").click({ position: { x: 0, y: 0 } });
		await page.getByRole("button", { name: "Create Project From Template: HTTP" }).scrollIntoViewIfNeeded();
		await page.getByRole("button", { name: "Create Project From Template: HTTP" }).click({ timeout: 2000 });

		await page.getByPlaceholder("Enter project name").fill(projectName);
		await page.getByRole("button", { name: "Create", exact: true }).click();
		await page.getByRole("button", { name: "Close AI Chat" }).click();

		try {
			await page.getByRole("button", { name: "Skip the tour", exact: true }).click({ timeout: 2000 });
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log("Skip the tour button not found, continuing...");
		}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		await dashboardPage.createProjectFromTemplate(projectName);
	}

	await expect(page.getByText("webhooks.py")).toBeVisible();

	const deployButton = page.getByRole("button", { name: "Deploy project" });

	await page.waitForLoadState("networkidle");
	await page.waitForTimeout(2000);
	await expect(deployButton).toBeVisible();
	await expect(deployButton).toBeEnabled();

	try {
		await deployButton.click({ timeout: 5000 });
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		await deployButton.scrollIntoViewIfNeeded();
		await page.waitForTimeout(500);
		await deployButton.click({ force: true });
	}
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
