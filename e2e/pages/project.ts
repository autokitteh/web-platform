import type { Locator, Page } from "@playwright/test";
import randomatic from "randomatic";

export class ProjectPage {
	private readonly createButton: Locator;

	constructor(public readonly page: Page) {
		this.createButton = this.page.locator('button[aria-label="Project additional actions"]');
	}

	async deleteProject() {
		await this.createButton.hover();
		await this.createButton.click();
		await this.page.getByPlaceholder("Enter project name").fill(randomatic("Aa", 8));
		await this.page.getByRole("button", { name: "Create", exact: true }).click();
		await this.page.getByRole("cell", { name: "program.py" }).isVisible();
		await this.page.getByRole("tab", { name: "PROGRAM.PY" }).isVisible();
		await this.page.getByText('print("Hello World!")').isVisible();
		await this.page.waitForLoadState("domcontentloaded");
	}
}
