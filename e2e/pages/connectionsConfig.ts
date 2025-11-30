import { type Locator, type Page, expect } from "@playwright/test";

export class ConnectionsConfig {
	constructor(protected readonly page: Page) {}

	async fillConnectionName(name: string) {
		await this.page.getByLabel("Name", { exact: true }).fill(name);
	}

	async selectIntegration(integrationLabel: string) {
		const selectWrapper = this.page.locator('[data-testid^="select-integration-"]').first();
		await selectWrapper.click();

		await this.page.getByRole("combobox", { name: "Select integration", exact: true }).fill(integrationLabel);

		expect(this.page.getByRole("option", { name: integrationLabel, exact: true })).toBeVisible();

		await this.page.getByRole("option", { name: integrationLabel, exact: true }).click();
	}

	async selectConnectionType(connectionTypeLabel: string) {
		const combobox = this.page.getByRole("combobox", { name: "Select connection type", exact: true });

		await combobox.click();
		await combobox.fill(connectionTypeLabel);

		await this.page.waitForLoadState("networkidle");

		const option = this.page.getByRole("option", { name: connectionTypeLabel, exact: true });
		await option.waitFor({ state: "visible", timeout: 1000 });

		await this.page.evaluate((label) => {
			const option = Array.from(document.querySelectorAll('[role="option"]')).find((el) =>
				el.textContent?.includes(label)
			);
			if (option instanceof HTMLElement) {
				option.click();
			}
		}, connectionTypeLabel);
	}

	async expectAnySubmitButton(): Promise<void> {
		const saveButton = this.page.getByRole("button", { exact: true, name: "Save Connection" });
		const oauthButton = this.page.getByRole("button", { exact: true, name: "Start OAuth Flow" });

		try {
			await Promise.race([
				saveButton.waitFor({ state: "visible", timeout: 500 }),
				oauthButton.waitFor({ state: "visible", timeout: 500 }),
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
		await expect(button).toBeVisible({ timeout: 1000 });
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	async expectStartOAuthFlowButton() {
		const button = this.page.getByRole("button", { exact: true, name: "Start OAuth Flow" });
		await expect(button).toBeVisible({ timeout: 1000 });
	}

	async clickSaveConnection() {
		await this.page.getByRole("button", { name: "Save Connection" }).click();
	}

	async confirmDelete() {
		await this.page.getByRole("button", { name: "Delete", exact: true }).click();
	}

	async cancelDelete() {
		await this.page.getByRole("button", { name: "Cancel" }).click();
	}

	async getConnectionRow(connectionName: string): Promise<Locator> {
		const row = this.page.getByRole("row", { name: `Select ${connectionName} row`, exact: true });
		await row.scrollIntoViewIfNeeded();
		await expect(row).toBeVisible();
		return row;
	}

	async getConnectionCell(connectionName: string): Promise<Locator | null> {
		try {
			const cell = this.page.getByRole("cell", { name: connectionName, exact: true });
			await expect(cell).toBeVisible();
			return cell;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			return null;
		}
	}

	async clickConnectionRow(connectionName: string) {
		const row = await this.getConnectionRow(connectionName);
		await row.scrollIntoViewIfNeeded();
		await row.click();
	}

	async clickConnectionCell(connectionName: string) {
		const cell = await this.getConnectionCell(connectionName);
		if (!cell) {
			throw new Error(`Connection ${connectionName} not found`);
		}
		await cell.click();
	}

	async clickConfigureButton(connectionName: string) {
		const row = await this.getConnectionRow(connectionName);
		await row.getByRole("button", { name: "Configure" }).click();
	}

	async clickDeleteButton(connectionName: string) {
		const row = await this.getConnectionRow(connectionName);
		await row.getByRole("button", { name: "Delete" }).click();
	}

	async isConnectionVisible(connectionName: string): Promise<boolean> {
		const row = await this.getConnectionRow(connectionName);
		return row.isVisible();
	}
}
