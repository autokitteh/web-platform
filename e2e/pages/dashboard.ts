import type { Locator, Page } from "@playwright/test";

export class DashboardPage {
	private readonly createButton: Locator;

	constructor(public readonly page: Page) {
		this.createButton = this.page.locator('nav[aria-label="Main navigation"] button[aria-label="New Project"]');
	}

	async createProjectFromMenu() {
		await this.page.goto("/");
		await this.createButton.hover();
		await this.createButton.click();
		await this.page.getByRole("cell", { name: "program.py" });
		await this.page.getByRole("tab", { name: "PROGRAM.PY" }).isVisible();
		await this.page.getByText('print("Hello World!")').isVisible();
	}
}
