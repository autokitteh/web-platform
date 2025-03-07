import type { Locator, Page } from "@playwright/test";
import randomatic from "randomatic";

export class DashboardPage {
	private readonly createButton: Locator;

	constructor(public readonly page: Page) {
		this.createButton = this.page.locator('nav[aria-label="Main navigation"] button[aria-label="New Project"]');
	}

	async createProjectFromMenu() {
		await this.page.goto("/");
		await this.createButton.hover();
		await this.createButton.click();
		await this.page.getByPlaceholder("Enter project name").fill(randomatic("Aa", 8));
		await this.page.getByRole("button", { name: "Create", exact: true }).click();
		await this.page.getByRole("cell", { name: "program.py" }).isVisible();
		await this.page.getByRole("tab", { name: "PROGRAM.PY" }).isVisible();
		await this.page.getByText('print("Hello World!")').isVisible();
		await this.page.waitForLoadState("domcontentloaded");
	}

	async createProjectFromTemplate(projectName: string) {
		await this.page.goto("/");
		// await this.page.getByRole("tab", { name: "Samples" }).click();
		await this.page.locator("//h3[contains(text(),'HTTP')]").scrollIntoViewIfNeeded();
		await this.page.getByRole("button", { name: "Create Project From Template: HTTP" }).click();
		await this.page.getByPlaceholder("Enter project name").fill(projectName);
		await this.page.getByRole("button", { name: "Create", exact: true }).click();
	}
}
