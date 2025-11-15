import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { waitForToast } from "e2e/utils";

export class ProjectPage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async deleteProject(projectName: string) {
		await this.page.locator('button[aria-label="Project additional actions"]').hover();
		await this.page.locator('button[aria-label="Delete project"]').click();
		await this.page.locator('button[aria-label="Ok"]').click();
		const successToast = await waitForToast(this.page, "Project deletion completed successfully");
		await expect(successToast).toBeVisible();

		const loaders = this.page.locator(".loader-cycle-disks").all();
		const loadersArray = await loaders;
		await Promise.all(loadersArray.map((loader) => loader.waitFor({ state: "detached" })));

		await this.page.getByRole("heading", { name: /^Welcome to .+$/, level: 1 }).isVisible();

		await expect(successToast).not.toBeVisible({ timeout: 10000 });

		const deletedProjectNameCell = this.page.getByRole("cell", { name: projectName });

		await expect(deletedProjectNameCell).toHaveCount(0);

		await this.page.locator('button[aria-label="System Log"]').click();

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
