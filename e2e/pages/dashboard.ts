import { expect, type Locator, type Page } from "@playwright/test";
import randomatic from "randomatic";

import { waitForLoadingOverlayGone } from "e2e/utils/waitForLoadingOverlayToDisappear";
import { waitForMonacoEditorToLoad } from "e2e/utils/waitForMonacoEditor";

export class DashboardPage {
	private readonly createButton: Locator;
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
		this.createButton = this.page.locator('nav[aria-label="Main navigation"] button[aria-label="New Project"]');
	}

	protected getByRole(role: Parameters<Page["getByRole"]>[0], options?: Parameters<Page["getByRole"]>[1]) {
		return this.page.getByRole(role, options);
	}

	protected getByTestId(testId: string) {
		return this.page.getByTestId(testId);
	}

	protected getByPlaceholder(placeholder: string) {
		return this.page.getByPlaceholder(placeholder);
	}

	protected getByText(text: string) {
		return this.page.getByText(text);
	}

	async createProjectFromMenu() {
		await waitForLoadingOverlayGone(this.page);
		await this.page.goto("/");
		await this.createButton.hover();
		await this.createButton.click();
		await this.page.locator('button[aria-label="New Project From Scratch"]').hover();
		await this.page.locator('button[aria-label="New Project From Scratch"]').click();
		await this.page.getByPlaceholder("Enter project name").fill(randomatic("Aa", 8));
		await this.page.locator('button[aria-label="Create"]').click();

		await expect(this.page.locator('button[aria-label="Open program.py"]')).toBeVisible();
		await this.page.locator('button[aria-label="Open program.py"]').click();
		await expect(this.page.locator('tab[aria-label="program.py"]')).toBeVisible();

		await waitForMonacoEditorToLoad(this.page, 20000);

		await this.page.waitForLoadState("domcontentloaded");
		await this.page.locator('button[aria-label="Skip the tour"]').click({ timeout: 1000 });
	}

	async createProjectFromTemplate(projectName: string) {
		await this.page.goto("/");
		await this.page.getByLabel("Categories").click();
		await this.page.getByRole("option", { name: "Samples" }).click();
		await this.page.locator("body").click({ position: { x: 0, y: 0 } });
		await this.page.locator('button[aria-label="Create Project From Template: HTTP"]').scrollIntoViewIfNeeded();
		await this.page.locator('button[aria-label="Create Project From Template: HTTP"]').click();
		await this.page.getByPlaceholder("Enter project name").fill(projectName);
		await this.page.locator('button[aria-label="Create"]').click();
		await this.page.locator('button[aria-label="Skip the tour"]').click({ timeout: 1000 });
	}
}
