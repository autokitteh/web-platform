import { expect, type Locator, type Page } from "@playwright/test";

import { ConnectionFormPage } from "./connectionFormPage.ts";
import { testIntegrationName } from "../constants/globalConnections.constants";
import { waitForLoadingOverlayGone } from "e2e/utils/waitForLoadingOverlayToDisappear";

export class GlobalConnectionsPage {
	private readonly page: Page;
	private readonly addConnectionButton: Locator;
	private readonly connectionForm: ConnectionFormPage;

	constructor(page: Page) {
		this.page = page;
		this.addConnectionButton = this.page.getByRole("button", { name: "Add Connection" });
		this.connectionForm = new ConnectionFormPage(page);
	}

	async goto() {
		await this.page.goto("/");
		await waitForLoadingOverlayGone(this.page);
		await this.page.goto("/connections");
		await waitForLoadingOverlayGone(this.page);
		await expect(this.page.getByRole("heading", { name: /Global Connections \(\d+\)/ })).toBeVisible();
	}

	async clickAddConnection() {
		await this.addConnectionButton.click();
		await this.page.waitForURL("/connections/new");
	}

	async fillConnectionName(name: string) {
		await this.connectionForm.fillConnectionName(name);
	}

	async selectIntegration(integrationLabel: string) {
		await this.connectionForm.selectIntegration(integrationLabel);
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

		await this.connectionForm.clickSaveConnection();

		return connectionName;
	}

	async getConnectionRow(connectionName: string): Promise<Locator> {
		return this.connectionForm.getConnectionRow(connectionName);
	}

	async getConnectionCell(connectionName: string): Promise<Locator | null> {
		return this.connectionForm.getConnectionCell(connectionName);
	}

	async clickConnectionRow(connectionName: string) {
		await this.connectionForm.clickConnectionRow(connectionName);
	}

	async clickConnectionCell(connectionName: string) {
		await this.connectionForm.clickConnectionCell(connectionName);
	}

	async clickConfigureButton(connectionName: string) {
		await this.connectionForm.clickConfigureButton(connectionName);
	}

	async clickDeleteButton(connectionName: string) {
		await this.connectionForm.clickDeleteButton(connectionName);
	}

	async confirmDelete() {
		await this.connectionForm.confirmDelete();
	}

	async cancelDelete() {
		await this.connectionForm.cancelDelete();
	}

	async isConnectionVisible(connectionName: string): Promise<boolean> {
		return this.connectionForm.isConnectionVisible(connectionName);
	}
}
