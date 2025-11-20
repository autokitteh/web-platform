import { expect, type APIRequestContext, type Page } from "@playwright/test";
import randomatic from "randomatic";

import { DashboardPage } from "./dashboard";
import { waitForToast } from "e2e/utils";
import { waitForLoadingOverlayGone } from "e2e/utils/waitForLoadingOverlayToDisappear";

export class WebhookSessionPage {
	private readonly page: Page;
	private readonly request: APIRequestContext;
	private readonly dashboardPage: DashboardPage;
	public projectName: string;

	constructor(page: Page, request: APIRequestContext) {
		this.page = page;
		this.request = request;
		this.dashboardPage = new DashboardPage(page);
		this.projectName = `test_${randomatic("Aa", 4)}`;
	}

	async waitForFirstCompletedSession(timeoutMs = 120000) {
		await expect(async () => {
			const refreshButton = this.page.locator('button[aria-label="Refresh"]');
			const isDisabled = await refreshButton.evaluate((element) => (element as HTMLButtonElement).disabled);

			if (!isDisabled) {
				await refreshButton.click();
			}

			const completedSession = await this.page.getByRole("button", { name: "1 Completed" }).isVisible();

			expect(completedSession).toBe(true);

			return true;
		}).toPass({
			timeout: timeoutMs,
			intervals: [3000],
		});
	}

	async setupProjectAndTriggerSession() {
		await this.page.goto("/welcome");

		await this.page.getByRole("heading", { name: /^Welcome to .+$/, level: 1 }).isVisible();

		try {
			await this.page.locator('button[aria-label="Start From Template"]').click();

			await expect(this.page.getByText("Start From Template")).toBeVisible();

			await this.page.getByLabel("Categories").click();
			await this.page.getByRole("option", { name: "Samples" }).click();
			await this.page.locator("body").click({ position: { x: 0, y: 0 } });
			await this.page.locator('button[aria-label="Create Project From Template: HTTP"]').scrollIntoViewIfNeeded();
			await this.page.locator('button[aria-label="Create Project From Template: HTTP"]').click();

			await this.page.getByPlaceholder("Enter project name").fill(this.projectName);
			await this.page.locator('button[aria-label="Create"]').click();
			await this.page.waitForURL(/\/explorer\/settings/);
			await expect(this.page.getByRole("heading", { name: "Configuration" })).toBeVisible();
		} catch (error) {
			// Check if page is still open before attempting fallback
			if (!this.page.isClosed()) {
				await this.dashboardPage.createProjectFromTemplate(this.projectName);
			} else {
				throw error;
			}
		}

		await waitForLoadingOverlayGone(this.page);
		await this.page.locator('button[aria-label="Open Triggers Section"]').click();
		await expect(
			this.page.locator(`button[aria-label='Trigger information for "receive_http_get_or_head"']`)
		).toBeVisible();
		await this.page.locator(`button[aria-label='Trigger information for "receive_http_get_or_head"']`).hover();

		const copyButton = await this.page.waitForSelector('[data-testid="copy-receive_http_get_or_head-webhook-url"]');
		const webhookUrl = await copyButton.getAttribute("value");

		if (!webhookUrl) {
			throw new Error("Failed to get webhook URL from button value attribute");
		}

		await this.page.locator('button[aria-label="Deploy project"]').click();

		const toast = await waitForToast(this.page, "Project deployment completed successfully");
		await expect(toast).toBeVisible();

		const response = await this.request.get(webhookUrl, {
			timeout: 5000,
		});

		if (!response.ok()) {
			throw new Error(`Webhook request failed with status ${response.status()}`);
		}

		await this.page.locator('button[aria-label="Deployments"]').click();
		await expect(this.page.getByText("Deployment History")).toBeVisible();

		await expect(this.page.getByRole("heading", { name: "Configuration" })).toBeVisible();
		await this.page.locator('button[aria-label="Close Project Settings"]').click();

		await expect(this.page.getByText("Active").first()).toBeVisible();
		const deploymentId = this.page.getByText(/bld_*/);
		await expect(deploymentId).toBeVisible();

		await this.waitForFirstCompletedSession();
	}
}
