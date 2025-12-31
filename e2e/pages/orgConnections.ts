import { expect, type Page } from "@playwright/test";

import { ConnectionsConfig } from "./connectionsConfig";
import { testIntegrationName } from "../constants/orgConnections.constants";
import { waitForLoadingOverlayGone } from "../utils/waitForLoadingOverlayToDisappear";
import { waitForToastToBeRemoved } from "../utils/waitForToast";

export class OrgConnectionsPage {
	private readonly page: Page;
	readonly connectionsConfig: ConnectionsConfig;

	constructor(page: Page) {
		this.page = page;
		this.connectionsConfig = new ConnectionsConfig(page);
	}

	async goto() {
		await this.page.goto("/");
		await waitForLoadingOverlayGone(this.page);
		await this.page.getByRole("link", { name: "Connections" }).click();
		await waitForLoadingOverlayGone(this.page);
		await expect(this.page.getByRole("heading", { name: /Org Connections \(\d+\)/ })).toBeVisible();
	}

	async clickAddConnection() {
		await this.page.getByRole("button", { name: "Add Connection" }).click();
		await this.page.waitForURL("/connections/new");
	}

	async fillTwilioAccountSidAndApiTokenAndApiSecret() {
		await this.page.getByRole("textbox", { name: "Account SID" }).fill("AC1234567890");
		await this.page.getByRole("textbox", { name: "API Token" }).fill("1234567890");
		await this.page.getByRole("textbox", { name: "API Secret" }).fill("1234567899");
	}

	async createTwilioConnection(connectionName: string): Promise<string> {
		await this.clickAddConnection();
		await this.connectionsConfig.fillConnectionName(connectionName);
		await this.connectionsConfig.selectIntegration(testIntegrationName);
		await this.connectionsConfig.selectConnectionType("API Token");
		await this.fillTwilioAccountSidAndApiTokenAndApiSecret();

		await this.connectionsConfig.clickSaveConnection();
		await this.page.waitForURL(/\/connections\/.*\/edit/);
		await waitForToastToBeRemoved(this.page, "Connection created successfully");

		return connectionName;
	}
}
