import { expect, type Page } from "@playwright/test";

import { ConnectionsConfig } from "./connectionsConfig";
import { testIntegrationName } from "../constants/globalConnections.constants";
import { waitForLoadingOverlayGone } from "../utils/waitForLoadingOverlayToDisappear";

export class GlobalConnectionsPage {
	private readonly page: Page;
	readonly connectionsConfig: ConnectionsConfig;

	constructor(page: Page) {
		this.page = page;
		this.connectionsConfig = new ConnectionsConfig(page);
	}

	async goto() {
		await this.page.goto("/");
		await waitForLoadingOverlayGone(this.page);
		await this.page.goto("/connections");
		await waitForLoadingOverlayGone(this.page);
		await expect(this.page.getByRole("heading", { name: /Global Connections \(\d+\)/ })).toBeVisible();
	}

	async clickAddConnection() {
		await this.page.getByRole("button", { name: "Add Connection" }).click();
		await this.page.waitForURL("/connections/new");
	}

	async fillTwilioAccountSidAndAuthToken() {
		await this.page.getByRole("textbox", { name: "Account SID" }).fill("AC1234567890");
		await this.page.getByRole("textbox", { name: "Auth Token" }).fill("1234567890");
	}

	async createTwilioConnection(connectionName: string): Promise<string> {
		await this.clickAddConnection();
		await this.connectionsConfig.fillConnectionName(connectionName);
		await this.connectionsConfig.selectIntegration(testIntegrationName);
		await this.connectionsConfig.selectConnectionType("Auth Token");
		await this.fillTwilioAccountSidAndAuthToken();

		await this.connectionsConfig.clickSaveConnection();

		return connectionName;
	}
}
