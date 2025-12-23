import { type Locator, type Page, expect } from "@playwright/test";

import { waitForToastToBeRemoved } from "../utils";

export class ConnectionsConfig {
	constructor(protected readonly page: Page) {}

	async fillConnectionName(name: string) {
		await this.page.getByLabel("Name", { exact: true }).fill(name);
	}

	async selectIntegration(integrationLabel: string) {
		const combobox = this.page.getByRole("combobox", { name: "Select integration", exact: true });
		await combobox.click();
		await combobox.fill(integrationLabel);

		const escapedLabel = integrationLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		// eslint-disable-next-line security/detect-non-literal-regexp
		const option = this.page.getByRole("option", { name: new RegExp(`^${escapedLabel}$`) });
		await expect(option).toBeVisible();
		await this.page.waitForTimeout(2000);
		await option.click();
		await this.page.waitForTimeout(1500);
	}

	async selectConnectionType(connectionTypeLabel: string) {
		const combobox = this.page.getByRole("combobox", { name: "Select connection type", exact: true });

		await combobox.click();
		await this.page.waitForTimeout(200);

		const listbox = this.page.getByRole("listbox");
		await listbox.waitFor({ state: "visible", timeout: 3000 });

		const escapedLabel = connectionTypeLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		// eslint-disable-next-line security/detect-non-literal-regexp
		const option = listbox.getByRole("option", { name: new RegExp(`^${escapedLabel}$`) });
		await option.waitFor({ state: "visible", timeout: 3000 });

		const optionBound = await option.boundingBox();
		if (optionBound) {
			await this.page.mouse.click(optionBound.x + optionBound.width / 2, optionBound.y + optionBound.height / 2);
		} else {
			await option.click({
				timeout: 5000,
			});
		}

		await this.page.waitForTimeout(500);
	}

	async expectAnySubmitButton(): Promise<void> {
		const saveButton = this.page.getByRole("button", { exact: true, name: "Save Connection" });
		const oauthButton = this.page.getByRole("button", { exact: true, name: "Start OAuth Flow" });

		try {
			await Promise.race([
				saveButton.waitFor({ state: "visible", timeout: 5000 }),
				oauthButton.waitFor({ state: "visible", timeout: 5000 }),
			]);
		} catch {
			throw new Error('Neither "Save Connection" nor "Start OAuth Flow" button appeared within 5 seconds');
		}

		const saveVisible = await saveButton.isVisible();
		const oauthVisible = await oauthButton.isVisible();

		if (!saveVisible && !oauthVisible) {
			throw new Error('Neither "Save Connection" nor "Start OAuth Flow" button is visible');
		}

		if (saveVisible) {
			await saveButton.scrollIntoViewIfNeeded();
		} else if (oauthVisible) {
			await oauthButton.scrollIntoViewIfNeeded();
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
		const deleteButton = this.page.getByRole("button", { name: "Delete", exact: true });
		await expect(deleteButton).toBeVisible({ timeout: 1500 });
		await deleteButton.click();
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
	async closeConnectionRemovedSuccessfullyToast(connectionName: string) {
		await waitForToastToBeRemoved(this.page, `${connectionName} deleted successfully`, "Success");
	}
}
