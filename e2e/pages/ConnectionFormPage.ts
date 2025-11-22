/* eslint-disable unicorn/filename-case */
import { Page, expect } from "@playwright/test";

export class ConnectionFormPage {
	constructor(private readonly page: Page) {}

	async fillConnectionName(name: string) {
		await this.page.getByLabel("Name", { exact: true }).fill(name);
	}

	async selectIntegration(integrationLabel: string) {
		await this.page.getByTestId("select-integration").click();

		await this.page.waitForSelector('[role="option"]', { state: "visible" });

		await this.page.getByRole("option", { name: integrationLabel, exact: true }).click();
	}

	async selectConnectionType(connectionTypeLabel: string) {
		await this.page.getByLabel("Connection type", { exact: true }).click();

		await this.page.waitForSelector('[role="option"]', { state: "visible" });

		await this.page.getByRole("option", { name: connectionTypeLabel, exact: true }).click();
	}

	async expectAnySubmitButton(): Promise<void> {
		const saveButton = this.page.getByRole("button", { exact: true, name: "Save Connection" });
		const oauthButton = this.page.getByRole("button", { exact: true, name: "Start OAuth Flow" });

		try {
			await Promise.race([
				saveButton.waitFor({ state: "visible", timeout: 10000 }),
				oauthButton.waitFor({ state: "visible", timeout: 10000 }),
			]);
		} catch {
			throw new Error('Neither "Save Connection" nor "Start OAuth Flow" button appeared within 10 seconds');
		}

		const saveVisible = await saveButton.isVisible();
		const oauthVisible = await oauthButton.isVisible();

		if (!saveVisible && !oauthVisible) {
			throw new Error('Neither "Save Connection" nor "Start OAuth Flow" button is visible');
		}
	}

	async expectSaveConnectionButton() {
		const button = this.page.getByRole("button", { exact: true, name: "Save Connection" });
		await expect(button).toBeVisible({ timeout: 10000 });
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	async expectStartOAuthFlowButton() {
		const button = this.page.getByRole("button", { exact: true, name: "Start OAuth Flow" });
		await expect(button).toBeVisible({ timeout: 10000 });
	}
}
