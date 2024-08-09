import { DashboardPage } from "./dashboard";

export class ConnectionPage extends DashboardPage {
	async startCreateConnection(connectionName: string, connectionType: string) {
		await this.createProjectFromMenu();

		await this.page.getByRole("tab", { name: "Connections" }).click();

		await this.page.getByRole("button", { name: "Add new" }).click();

		const nameInput = this.page.getByRole("textbox", { exact: true, name: "Name" });
		await nameInput.click();
		await nameInput.fill(connectionName);

		await this.page.getByTestId("select-connection-type").click();
		await this.page.getByRole("option", { name: connectionType }).click();
	}
}
