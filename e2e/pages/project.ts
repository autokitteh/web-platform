import { type Page, expect } from "@playwright/test";

import { waitForToast } from "e2e/utils";

export class ProjectPage {
	constructor(public readonly page: Page) {}

	async deleteProject(projectName: string) {
		await this.page.locator('button[aria-label="Project additional actions"]').hover();
		await this.page.locator('button[aria-label="Delete project"]').click();
		await this.page.locator('button[aria-label="Ok"]').click();
		const toast = await waitForToast(this.page, "Project deletion completed successfully");
		await expect(toast).toBeVisible();

		await this.page.waitForLoadState("domcontentloaded");

		const loaders = this.page.locator(".loader-cycle-disks").all();
		const loadersArray = await loaders;
		await Promise.all(loadersArray.map((loader) => loader.waitFor({ state: "hidden" })));

		const homepageTitle = this.page.getByText("Welcome to AutoKitteh");
		await expect(homepageTitle).toBeVisible();

		const deletedProjectName = this.page.getByText(projectName);
		await expect(deletedProjectName).not.toBeVisible();
	}

	async stopDeployment() {
		await this.page.locator('button[aria-label="Deployments"]').click();
		await this.page.locator('button[aria-label="Deactivate deployment"]').click();

		const toast = await waitForToast(this.page, "Deployment deactivated successfully");
		await expect(toast).toBeVisible();

		const deploymentTableRow = this.page.getByRole("cell", { name: "inactive" });
		await expect(deploymentTableRow).toHaveCount(1);
	}
}
