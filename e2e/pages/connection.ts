import { DashboardPage } from "./dashboard";

export class ConnectionPage extends DashboardPage {
	async startCreateConnection(connectionName: string, connectionType: string) {
		await this.createProjectFromMenu();

		await this.click('tab:has-text("Connections")');
		await this.click('button:has-text("Add new")');

		const nameInput = this.getByRole("textbox", { exact: true, name: "Name" });
		await nameInput.click();
		await nameInput.fill(connectionName);

		await this.getByTestId("select-integration").click();
		await this.getByRole("option", { name: connectionType }).click();
	}
}
