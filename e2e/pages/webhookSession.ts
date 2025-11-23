/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
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

	async waitForFirstCompletedSession(timeoutMs = 180000) {
		await expect(async () => {
			const refreshButton = this.page.locator('button[aria-label="Refresh"]');
			const isDisabled = await refreshButton.evaluate((element) => (element as HTMLButtonElement).disabled);

			if (!isDisabled) {
				// Monitor network requests when Refresh button is clicked
				const requests: Array<{
					headers: Record<string, string>;
					method: string;
					postData?: string;
					timestamp: number;
					url: string;
				}> = [];
				const responses: Array<{
					body?: string;
					headers: Record<string, string>;
					status: number;
					statusText: string;
					timestamp: number;
					url: string;
				}> = [];

				// Set up request listener
				const requestListener = (request: any) => {
					const url = request.url();
					const method = request.method();
					const headers = request.headers();
					const postData = request.postData();

					const timestamp = Date.now();
					requests.push({
						url,
						method,
						postData: postData || undefined,
						headers: Object.fromEntries(Object.entries(headers)),
						timestamp,
					});

					console.log(`[NETWORK REQUEST] ${method} ${url}`);
					if (postData) {
						console.log(
							`[REQUEST BODY] ${postData.substring(0, 500)}${postData.length > 500 ? "..." : ""}`
						);
					}
				};

				// Set up response listener
				const responseListener = async (response: any) => {
					const url = response.url();
					const status = response.status();
					const statusText = response.statusText();
					const headers = response.headers();

					let body: string | undefined;
					try {
						body = await response.text();
					} catch (e) {
						// Some responses might not have a text body
						body = undefined;
					}

					const timestamp = Date.now();
					responses.push({
						url,
						status,
						statusText,
						headers: Object.fromEntries(Object.entries(headers)),
						body,
						timestamp,
					});

					console.log(`[NETWORK RESPONSE] ${status} ${statusText} ${url}`);
					if (body && body.length < 1000) {
						// Only log body if it's reasonably small
						console.log(`[RESPONSE BODY] ${body}`);
					} else if (body) {
						console.log(`[RESPONSE BODY] (${body.length} chars, first 500): ${body.substring(0, 500)}...`);
					}
				};

				// Attach listeners
				this.page.on("request", requestListener);
				this.page.on("response", responseListener);

				try {
					const clickTimestamp = Date.now();

					// Click the refresh button
					await refreshButton.click();

					// Wait a bit for network requests to complete
					// Use Promise.race to wait for any response, but don't fail if none comes
					try {
						await Promise.race([
							this.page.waitForResponse(
								() => {
									// Capture responses that come within 5 seconds of the click
									return true;
								},
								{ timeout: 12000 }
							),
							new Promise((resolve) => setTimeout(resolve, 2000)), // Wait at least 2 seconds
						]);
					} catch (e) {
						// It's okay if no response comes - we still captured what we could
						console.log("[NETWORK MONITOR] No response captured within timeout, continuing...");
					}

					// Give a moment for any additional requests/responses to complete
					await new Promise((resolve) => setTimeout(resolve, 1000));

					// Log comprehensive summary
					console.log("\n=== NETWORK MONITORING SUMMARY (Refresh Button Click) ===");
					console.log(`Click Timestamp: ${new Date(clickTimestamp).toISOString()}`);
					console.log(`Total Requests Captured: ${requests.length}`);
					console.log(`Total Responses Captured: ${responses.length}`);

					if (requests.length > 0) {
						console.log("\n--- Network Requests (ordered by time) ---");
						requests.forEach((req, index) => {
							const timeSinceClick = req.timestamp - clickTimestamp;
							console.log(`${index + 1}. [${timeSinceClick}ms] ${req.method} ${req.url}`);
							if (req.postData) {
								console.log(
									`   Body: ${req.postData.substring(0, 200)}${req.postData.length > 200 ? "..." : ""}`
								);
							}
						});
					}

					if (responses.length > 0) {
						console.log("\n--- Network Responses (ordered by time) ---");
						responses.forEach((resp, index) => {
							const timeSinceClick = resp.timestamp - clickTimestamp;
							console.log(
								`${index + 1}. [${timeSinceClick}ms] ${resp.status} ${resp.statusText} ${resp.url}`
							);
							if (resp.body && resp.body.length < 500) {
								console.log(`   Body: ${resp.body}`);
							} else if (resp.body) {
								console.log(
									`   Body: (${resp.body.length} chars, first 200): ${resp.body.substring(0, 200)}...`
								);
							}
							// Log Content-Type if available
							const contentType = resp.headers["content-type"] || resp.headers["Content-Type"];
							if (contentType) {
								console.log(`   Content-Type: ${contentType}`);
							}
						});
					}

					// Try to identify the refresh-related request/response pair
					const refreshRelatedRequests = requests.filter(
						(req) => req.timestamp >= clickTimestamp && req.timestamp < clickTimestamp + 100
					);
					if (refreshRelatedRequests.length > 0) {
						console.log("\n--- Likely Refresh-Related Requests ---");
						refreshRelatedRequests.forEach((req) => {
							const matchingResponse = responses.find((resp) => resp.url === req.url);
							console.log(`Request: ${req.method} ${req.url}`);
							if (matchingResponse) {
								console.log(`  → Response: ${matchingResponse.status} ${matchingResponse.statusText}`);
							} else {
								console.log(`  → Response: (no matching response found)`);
							}
						});
					}

					console.log("========================================================\n");
				} finally {
					// Clean up listeners
					this.page.off("request", requestListener);
					this.page.off("response", responseListener);
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
	}

	async setupProjectAndTriggerSession() {
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
			await this.page.locator("body").click({ position: { x: 0, y: 0 } });
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

		await this.waitForFirstCompletedSession();
	}
}
