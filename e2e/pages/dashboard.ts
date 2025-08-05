import { expect, type Locator, type Page } from "@playwright/test";
import randomatic from "randomatic";

import { clickButtonSafely, ClickCloseAIChatSafely } from "e2e/utils/safeButtonClick";
import { waitForLoadingOverlayGone } from "e2e/utils/waitForLoadingOverlayToDisappear";

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
		await this.page.getByPlaceholder("Enter project name").fill(randomatic("Aa", 8));
		await clickButtonSafely(this.page, "Create", { exact: true });
		await expect(this.page.getByRole("cell", { name: "program.py" })).toBeVisible();
		await expect(this.page.getByRole("tab", { name: "PROGRAM.PY" })).toBeVisible();
		await expect(this.page.getByText('print("Meow, World!")')).toBeVisible();
		await this.page.waitForLoadState("domcontentloaded");

		try {
			await clickButtonSafely(this.page, "Skip the tour", { exact: true });
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

		const createTemplateButton = this.page.getByRole("button", { name: "Create Project From Template: HTTP" });
		await createTemplateButton.scrollIntoViewIfNeeded();
		await expect(createTemplateButton).toBeVisible();
		await expect(createTemplateButton).toBeEnabled();
		await createTemplateButton.click();

		await this.page.getByPlaceholder("Enter project name").fill(projectName);
		await clickButtonSafely(this.page, "Create", { exact: true });
		await ClickCloseAIChatSafely(this.page);

		try {
			await clickButtonSafely(this.page, "Skip the tour", { exact: true });
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log("Skip the tour button not found, continuing...");
		}
	}
}
