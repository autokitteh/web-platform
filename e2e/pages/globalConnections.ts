import { expect, type Locator, type Page } from "@playwright/test";

import { testIntegrationName } from "../constants/globalConnections.constants";
import { waitForLoadingOverlayGone } from "e2e/utils/waitForLoadingOverlayToDisappear";

export class GlobalConnectionsPage {
	private readonly page: Page;
	private readonly addConnectionButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.addConnectionButton = this.page.getByRole("button", { name: "Add Connection" });
	}

	async goto() {
		await this.page.goto("/");
		await waitForLoadingOverlayGone(this.page);
		await this.page.goto("/connections");
		await waitForLoadingOverlayGone(this.page);
		await expect(this.page.getByText("Connections", { exact: true })).toBeVisible();
	}

	async clickAddConnection() {
		await this.addConnectionButton.click();
		await this.page.waitForURL("/connections/new");
	}

	async fillConnectionName(name: string, invalid: boolean = false) {
		const connectionName = invalid ? `invalid-${name}` : name;
		await this.page.getByLabel("Name").fill(connectionName);
	}

	async selectIntegration(integrationLabel: string) {
		await this.page.getByTestId("select-integration").click();

		const integrationOption = this.page.getByRole("option", {
			name: `Select icon label ${integrationLabel}`,
			exact: true,
		});
		expect(integrationOption).toBeVisible();
		integrationOption.click();
		expect(integrationOption).not.toBeVisible();
	}

	async fillTwilioAccountSidAndAuthToken() {
		await this.page.getByRole("textbox", { name: "Account SID" }).fill("AC1234567890");
		await this.page.getByRole("textbox", { name: "Auth Token" }).fill("1234567890");
	}

	async createTwilioConnection(connectionName: string): Promise<string> {
		await this.clickAddConnection();
		await this.fillConnectionName(connectionName);
		await this.selectIntegration(testIntegrationName);
		await this.fillTwilioAccountSidAndAuthToken();

		await this.page.getByRole("button", { name: "Save Connection" }).click();

		return connectionName;
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

	async confirmDelete() {
		await this.page.getByRole("button", { name: "Delete", exact: true }).click();
	}

	async cancelDelete() {
		await this.page.getByRole("button", { name: "Cancel" }).click();
	}

	async isConnectionVisible(connectionName: string): Promise<boolean> {
		const row = await this.getConnectionRow(connectionName);
		return row.isVisible();
	}
}
