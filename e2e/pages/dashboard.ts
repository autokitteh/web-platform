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

		try {
			await page.getByRole("button", { name: "Skip the tour", exact: true, timeout: 2000 }).click();
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log("Skip the tour button not found, continuing...");
		}
	}

	async createProjectFromTemplate(projectName: string) {
		await this.page.goto("/");
		await this.page.getByLabel("Categories").click();
		await this.page.getByRole("option", { name: "Samples" }).click();
		await this.page.locator("body").click({ position: { x: 0, y: 0 } });
		await this.page.getByRole("button", { name: "Create Project From Template: HTTP" }).scrollIntoViewIfNeeded();
		await this.page.getByRole("button", { name: "Create Project From Template: HTTP" }).click();
		await this.page.getByPlaceholder("Enter project name").fill(projectName);
		await this.page.getByRole("button", { name: "Create", exact: true }).click();

		try {
			await page.getByRole("button", { name: "Skip the tour", exact: true, timeout: 2000 }).click();
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log("Skip the tour button not found, continuing...");
		}
	}
}
