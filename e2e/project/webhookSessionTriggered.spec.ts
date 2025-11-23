import type { APIRequestContext, Page } from "@playwright/test";

import { expect, test } from "../fixtures";
import { ProjectPage, WebhookSessionPage } from "e2e/pages";

interface SetupParams {
	page: Page;
	request: APIRequestContext;
}

test.describe("Session triggered with webhook", () => {
	let webhookSessionPage: WebhookSessionPage;

	test.beforeEach(async ({ page, request }: SetupParams) => {
		webhookSessionPage = new WebhookSessionPage(page, request);
		await webhookSessionPage.setupProjectAndTriggerSession();
	});

	test("Deploy project and execute session via webhook", async ({
		page,
		projectPage,
	}: {
		page: Page;
		projectPage: ProjectPage;
	}) => {
		const sessionCompletedLog = page.getByText("The session has finished with completed state");
		await expect(sessionCompletedLog).toBeVisible();

		await projectPage.stopDeployment();
		await projectPage.deleteProject(webhookSessionPage.projectName);
	});
});
