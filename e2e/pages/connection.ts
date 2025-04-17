import { DashboardPage } from "./dashboard";

export class ConnectionPage extends DashboardPage {
	async startCreateConnection(connectionName: string, connectionType: string) {
		await this.createProjectFromMenu();

		await this.getByRole("tab", { name: "Connections" }).click();

		await this.getByRole("button", { name: "Add new" }).click();

		const nameInput = this.getByRole("textbox", { exact: true, name: "Name" });
		await nameInput.click();
		await nameInput.fill(connectionName);

		await this.getByTestId("select-integration").click();
		await this.getByRole("option", { name: connectionType }).click();
	}
}
