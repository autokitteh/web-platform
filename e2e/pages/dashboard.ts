import { expect, type Page } from "@playwright/test";
import randomatic from "randomatic";

import { BasePage } from "./basePage";
import { waitForLoadingOverlayGone } from "e2e/utils/waitForLoadingOverlayToDisappear";
import { waitForMonacoEditorToLoad } from "e2e/utils/waitForMonacoEditor";

export class DashboardPage extends BasePage {
	constructor(page: Page) {
		super(page);
	}

	async createProjectFromMenu() {
		await waitForLoadingOverlayGone(this.page);
		await this.goto("/");
		await this.hover('nav[aria-label="Main navigation"] button[aria-label="New Project"]');
		await this.click('nav[aria-label="Main navigation"] button[aria-label="New Project"]');
		await this.click('button:has-text("Create from Scratch")');
		await this.fill('input[placeholder="Enter project name"]', randomatic("Aa", 8));
		await this.click('button:has-text("Create"):not([disabled])');

		await expect(this.page.getByRole("cell", { name: "program.py" })).toBeVisible();
		await expect(this.page.getByRole("tab", { name: "PROGRAM.PY" })).toBeVisible();

		await waitForMonacoEditorToLoad(this.page, 20000);

		await this.page.waitForLoadState("domcontentloaded");

		try {
			await this.page.getByRole("button", { name: "Skip the tour", exact: true }).click({ timeout: 2000 });
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log("Skip the tour button not found, continuing...");
		}
	}

	async createProjectFromTemplate(projectName: string) {
		await this.goto("/");
		await this.click('[aria-label="Categories"]');
		await this.click('option:has-text("Samples")');
		await this.page.locator("body").click({ position: { x: 0, y: 0 } });
		await this.page.getByRole("button", { name: "Create Project From Template: HTTP" }).scrollIntoViewIfNeeded();
		await this.click('button:has-text("Create Project From Template: HTTP")');
		await this.fill('input[placeholder="Enter project name"]', projectName);
		await this.click('button:has-text("Create"):not([disabled])');
		await this.click('button:has-text("Close AI Chat")');

		try {
			await this.page.getByRole("button", { name: "Skip the tour", exact: true }).click({ timeout: 2000 });
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log("Skip the tour button not found, continuing...");
		}
	}
}
