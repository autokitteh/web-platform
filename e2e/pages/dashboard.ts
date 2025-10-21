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
		await this.clickByRole("button", { name: "Create", exact: true });

		await expect(this.page.getByRole("cell", { name: "program.py" })).toBeVisible();
		await expect(this.page.getByRole("tab", { name: "PROGRAM.PY" })).toBeVisible();

		await waitForMonacoEditorToLoad(this.page, 20000);

		await this.page.waitForLoadState("domcontentloaded");

		try {
			await this.clickByRole("button", { name: "Skip the tour", exact: true });
			// eslint-disable-next-line no-empty
		} catch {}
	}

	async createProjectFromTemplate(projectName: string) {
		await this.goto("/");
		await this.click('[aria-label="Categories"]');
		await this.clickByRole("option", { name: "Samples", exact: true });
		await this.click("body", 0.05);
		await this.click('button:has-text("Create Project From Template: HTTP")');
		await this.fill('input[placeholder="Enter project name"]', projectName);
		await this.clickByRole("button", { name: "Create", exact: true });
		await this.clickByRole("button", { name: "Close AI Chat", exact: true });

		try {
			await this.clickByRole("button", { name: "Skip the tour", exact: true });
			// eslint-disable-next-line no-empty
		} catch {}
	}
}
