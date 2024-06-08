import type { Page, Locator } from "@playwright/test";

export class DashboardPage {
	private readonly createButton: Locator;

	constructor(public readonly page: Page) {
		this.createButton = this.page.locator('nav[aria-label="Main navigation"] button[aria-label="New Project"]');
	}

	async createProjectFromMenu() {
		await this.page.goto("/");
		await this.createButton.hover();
		await this.createButton.click();
	}
}
