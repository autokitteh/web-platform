import { expect, type APIRequestContext, type Page } from "@playwright/test";
import randomatic from "randomatic";

import { DashboardPage } from "./dashboard";
import { ProjectPage } from "./project";
import { createNetworkListeners, logNetworkDiagnostics, type NetworkCapture } from "../utils";
import { waitForLoadingOverlayGone } from "../utils/waitForLoadingOverlayToDisappear";

export class WebhookSessionPage {
	private readonly page: Page;
	private readonly request: APIRequestContext;
	private readonly dashboardPage: DashboardPage;
	private readonly projectPage: ProjectPage;
	public projectName: string;

	constructor(page: Page, request: APIRequestContext) {
		this.page = page;
		this.request = request;
		this.dashboardPage = new DashboardPage(page);
		this.projectPage = new ProjectPage(page);
		this.projectName = `test_${randomatic("Aa", 4)}`;
	}

	async waitForFirstCompletedSession(timeoutMs = 180000) {
		const allNetworkData: NetworkCapture[] = [];
		let attemptCounter = 0;
		let timePassed = 0;

		try {
			await expect(async () => {
				attemptCounter++;
				const refreshButton = this.page.locator('button[aria-label="Refresh"]');
				const isDisabled = await refreshButton.evaluate((element) => (element as HTMLButtonElement).disabled);

				if (!isDisabled) {
					const { requests, responses, startListening, stopListening } = createNetworkListeners(this.page);

					startListening();

					try {
						const clickTimestamp = Date.now();

						await refreshButton.click();

						try {
							await Promise.race([
								this.page.waitForResponse(() => true, { timeout: 3000 }),
								new Promise((resolve) => setTimeout(resolve, 2000)),
							]);
						} catch (e) {
							// eslint-disable-next-line no-console
							console.error(
								`No response received after ${timePassed} milliseconds, ${attemptCounter} attempt. Error:`,
								e
							);
							timePassed += 3000;
						}

						await new Promise((resolve) => setTimeout(resolve, 1000));

						allNetworkData.push({
							attemptNumber: attemptCounter,
							clickTimestamp,
							requests: [...requests],
							responses: [...responses],
						});
					} finally {
						stopListening();
					}
				}

				const completedSessionDeploymentColumn = this.page.getByRole("button", { name: "1 Completed" });
				await expect(completedSessionDeploymentColumn).toBeVisible();
				await expect(completedSessionDeploymentColumn).toBeEnabled();
				await completedSessionDeploymentColumn.click();

				const sessionCompletedLog = this.page.getByText("The session has finished with completed state");
				await expect(sessionCompletedLog).toBeVisible();

				return true;
			}).toPass({
				timeout: timeoutMs,
				intervals: [3000],
			});
		} catch (error) {
			logNetworkDiagnostics(allNetworkData, attemptCounter, error);
			throw error;
		}
	}

	async setupProjectAndTriggerSession(skipSessionToBeCompleted = false) {
		await this.page.goto("/welcome");

		try {
			await expect(
				this.page.getByText("Start from Template", {
					exact: true,
				})
			).toBeVisible();

			await this.page.locator('button[aria-label="Start from Template"]').click();

			await this.page.getByLabel("Categories").click();
			await this.page.getByRole("option", { name: "Samples" }).click();
			await this.page.keyboard.press("Escape");
			await this.page
				.locator('button[aria-label="Create Project From Template: HTTP sample"]')
				.scrollIntoViewIfNeeded();
			await this.page.locator('button[aria-label="Create Project From Template: HTTP sample"]').click();

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
		const configSidebar = this.page.getByTestId("project-sidebar-config");
		await expect(configSidebar).toBeVisible();

		const triggerInfoButton = configSidebar.locator(
			`button[aria-label='Trigger information for "receive_http_get_or_head"']`
		);
		await triggerInfoButton.scrollIntoViewIfNeeded();

		await expect(triggerInfoButton).toBeVisible();
		await triggerInfoButton.hover();

		const copyButton = await this.page.waitForSelector('[data-testid="copy-receive_http_get_or_head-webhook-url"]');
		const webhookUrl = await copyButton.getAttribute("value");

		if (!webhookUrl) {
			throw new Error("Failed to get webhook URL from button value attribute");
		}

		await this.page.keyboard.press("Escape");
		await this.projectPage.deployProject();

		const response = await this.request.get(webhookUrl, {
			timeout: 1000,
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

		if (!skipSessionToBeCompleted) {
			await this.waitForFirstCompletedSession();
		}
	}
}
