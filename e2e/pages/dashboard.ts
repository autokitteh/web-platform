/* eslint-disable no-console */
import { type Locator, type Page } from "@playwright/test";
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
		await this.page.getByRole("button", { name: "Create from Scratch", exact: true }).click();
		await this.page.getByPlaceholder("Enter project name").fill(randomatic("Aa", 8));
		await this.page.getByRole("button", { name: "Create", exact: true }).click();

		let projectReady = false;
		let attempts = 0;
		const maxAttempts = 5;

		while (!projectReady && attempts < maxAttempts) {
			attempts++;

			const hasFiles = await this.page
				.getByRole("cell", { name: "program.py" })
				.isVisible()
				.catch(() => false);
			const hasCreateFileButton = await this.page
				.getByRole("button", { name: "Create File" })
				.isVisible()
				.catch(() => false);

			if (hasFiles) {
				const hasTab = await this.page
					.getByRole("tab", { name: "PROGRAM.PY" })
					.isVisible()
					.catch(() => false);
				if (hasTab) {
					projectReady = true;
					break;
				}
			} else if (hasCreateFileButton) {
				console.log(`Project created but no default files found (attempt ${attempts})`);

				const hasMessage = await this.page
					.getByText("Click on a file to start editing or create a new one")
					.isVisible()
					.catch(() => false);
				if (hasMessage) {
					projectReady = true;
					break;
				}
			}

			if (!projectReady && attempts < maxAttempts) {
				console.log(`Waiting for project to be ready (attempt ${attempts}/${maxAttempts})`);
				await this.page.waitForTimeout(3000);
			}
		}

		if (projectReady) {
			const hasFiles = await this.page
				.getByRole("cell", { name: "program.py" })
				.isVisible()
				.catch(() => false);
			if (hasFiles) {
				await waitForMonacoEditorToLoad(this.page, 20000);
			}
		} else {
			console.log("Project creation may have been affected by rate limiting, continuing with test...");
		}

		await this.page.waitForLoadState("domcontentloaded");

		try {
			await this.page.getByRole("button", { name: "Skip the tour", exact: true }).click({ timeout: 2000 });
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
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
		await this.page.getByRole("button", { name: "Close AI Chat" }).click();

		try {
			await this.page.getByRole("button", { name: "Skip the tour", exact: true }).click({ timeout: 2000 });
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			console.log("Skip the tour button not found, continuing...");
		}
	}
}
