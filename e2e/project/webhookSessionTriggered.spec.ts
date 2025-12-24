import type { APIRequestContext, Page } from "@playwright/test";

import { expect, test } from "../fixtures";
import { WebhookSessionPage } from "../pages";
import { cleanupCurrentProject } from "../utils";

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

	test.afterEach(async ({ page }) => {
		await cleanupCurrentProject(page);
	});

	test("Deploy project and execute session via webhook", async ({ page }: { page: Page }) => {
		const sessionCompletedLog = page.getByText("The session has finished with completed state");
		await expect(sessionCompletedLog).toBeVisible();
	});
});
