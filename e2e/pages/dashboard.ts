import { expect, type Locator, type Page } from "@playwright/test";
import randomatic from "randomatic";

import { waitForLoadingOverlayGone } from "../utils/waitForLoadingOverlayToDisappear";
import { waitForMonacoEditorToLoad } from "../utils/waitForMonacoEditor";

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

	async createProjectFromMenu(): Promise<string> {
		await waitForLoadingOverlayGone(this.page);
		await this.page.goto("/");
		await this.createButton.hover();
		await this.createButton.click();
		await this.page.getByRole("button", { name: "New Project From Scratch" }).hover();
		await this.page.getByRole("button", { name: "New Project From Scratch" }).click();
		const projectName = randomatic("Aa", 8);
		await this.page.getByPlaceholder("Enter project name").fill(projectName);
		await this.page.getByRole("button", { name: "Create", exact: true }).click();
		await expect(this.page.locator('button[aria-label="Open program.py"]')).toBeVisible();
		await this.page.getByRole("button", { name: "Open program.py" }).click();

		await expect(this.page.getByRole("tab", { name: "program.py Close file tab" })).toBeVisible();

		await waitForMonacoEditorToLoad(this.page, 12000);

		await expect(this.page.getByRole("heading", { name: "Configuration" })).toBeVisible({ timeout: 1200 });

		return projectName;
	}

	async createProjectFromTemplate(projectName: string) {
		await this.page.goto("/welcome");
		await this.page.getByRole("button", { name: "Start from Template" }).hover();
		await this.page.getByRole("button", { name: "Start from Template" }).click();

		await this.page.getByLabel("Categories").click();
		await this.page.getByRole("option", { name: "Samples" }).click();
		await this.page.keyboard.press("Escape");
		await this.page.getByRole("button", { name: "Create Project From Template: HTTP" }).scrollIntoViewIfNeeded();
		await this.page.getByRole("button", { name: "Create Project From Template: HTTP" }).click();
		await this.page.getByPlaceholder("Enter project name").fill(projectName);
		await this.page.waitForTimeout(500);
		await this.page.getByRole("button", { name: "Create", exact: true }).click();
		await expect(this.page.getByRole("heading", { name: "Configuration" })).toBeVisible({ timeout: 1200 });
	}
}
