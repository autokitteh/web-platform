import { type Page, expect } from "@playwright/test";

import { waitForToast } from "e2e/utils";

export class ProjectPage {
	constructor(public readonly page: Page) {}

	async deleteProject(projectName: string) {
		await this.page.locator('button[aria-label="Project additional actions"]').hover();
		await this.page.locator('button[aria-label="Delete project"]').click();
		await this.page.locator('button[aria-label="Ok"]').click();
		const successToast = await waitForToast(this.page, "Project deletion completed successfully");
		await expect(successToast).toBeVisible();

		const loaders = this.page.locator(".loader-cycle-disks").all();
		const loadersArray = await loaders;
		await Promise.all(loadersArray.map((loader) => loader.waitFor({ state: "detached" })));

		const homepageTitle = this.page.getByText("Welcome to AutoKitteh");
		await expect(homepageTitle).toBeVisible();

		await expect(successToast).not.toBeVisible({ timeout: 10000 });

		const deletedProjectNameCell = this.page.getByRole("cell", { name: projectName });

		await expect(deletedProjectNameCell).toHaveCount(0);

		await this.page.getByRole("button", { name: "System Log", exact: true }).click();

		const deletedProjectLog = this.page.getByText(
			`Project deletion completed successfully, project name: ${projectName}`
		);
		await expect(deletedProjectLog).toBeVisible();
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
