import { expect, type Locator, type Page } from "@playwright/test";

import { randomName } from "../utils/randomName";
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

	async createProjectFromMenu(fixedName?: string): Promise<string> {
		await waitForLoadingOverlayGone(this.page);
		await this.page.goto("/?e2e=true");

		const projectName = fixedName ?? randomName();

		if (fixedName) {
			const existingProject = this.page.locator(`[data-testid="project-row-${fixedName}"]`);
			if (await existingProject.isVisible({ timeout: 1000 }).catch(() => false)) {
				await existingProject.locator('button[aria-label="Delete project"]').click();
				await this.page.getByRole("button", { name: "Ok", exact: true }).click();
				await this.page.waitForTimeout(500);
			}
		}

		await this.createButton.hover();
		await this.createButton.click();
		await this.page.getByRole("button", { name: "New Project From Scratch" }).hover();
		await this.page.getByRole("button", { name: "New Project From Scratch" }).click();
		await this.page.getByPlaceholder("Enter project name").fill(projectName);
		await this.page.getByRole("button", { name: "Create", exact: true }).click();

		const programPyButton = this.page.locator('button[aria-label="Open program.py"]');
		await programPyButton.waitFor({ state: "visible", timeout: 3000 });
		await programPyButton.waitFor({ state: "attached", timeout: 1000 });
		await programPyButton.click({ timeout: 3000 });

		await expect(this.page.getByRole("tab", { name: "program.py Close file tab" })).toBeVisible();

		await waitForMonacoEditorToLoad(this.page, 6000);

		await expect(this.page.getByRole("heading", { name: "Configuration" })).toBeVisible({ timeout: 1500 });

		return projectName;
	}

	async createProjectFromTemplate(projectName: string) {
		await this.page.goto("/welcome?e2e=true");
		await this.page.getByRole("button", { name: "Start from Template" }).hover();
		await this.page.getByRole("button", { name: "Start from Template" }).click();

		await this.page.getByLabel("Categories").click();
		await this.page.getByRole("option", { name: "Samples" }).click();
		await this.page.locator("body").click({ position: { x: 0, y: 0 } });
		await this.page.getByRole("button", { name: "Create Project From Template: HTTP" }).scrollIntoViewIfNeeded();
		await this.page.getByRole("button", { name: "Create Project From Template: HTTP" }).click();
		await this.page.getByPlaceholder("Enter project name").fill(projectName);
		await this.page.waitForTimeout(500);
		await this.page.getByRole("button", { name: "Create", exact: true }).click();
		await expect(this.page.getByRole("heading", { name: "Configuration" })).toBeVisible({ timeout: 5000 });
	}
}
