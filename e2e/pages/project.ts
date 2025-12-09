import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { waitForToast, waitForToastToBeRemoved } from "../utils";

export class ProjectPage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async deleteProject(projectName: string) {
		if (!projectName.trim().length) {
			throw new Error("Project name is required to delete a project");
		}

		if ((await this.page.getByRole("button", { name: "Edit project title" }).textContent()) !== projectName) {
			throw new Error("Project name is not the same as the one in the page");
		}

		await this.page.locator('button[aria-label="Project additional actions"]').hover();
		await this.page.locator('button[aria-label="Delete project"]').click();
		await this.page.locator('button[aria-label="Ok"]').click();

		await waitForToastToBeRemoved(this.page, "Project deletion completed successfully");

		await this.page.mouse.move(0, 0);

		const loaders = this.page.locator(".loader-cycle-disks").all();
		const loadersArray = await loaders;
		await Promise.all(loadersArray.map((loader) => loader.waitFor({ state: "detached" })));

		const deletedProjectNameCell = this.page.getByRole("cell", { name: projectName });

		await expect(deletedProjectNameCell).toHaveCount(0);

		await this.page.locator('button[aria-label="System Log"]').click();

		const deletedProjectLogText = `Project deletion completed successfully, project name: ${projectName}`;

		const deletedProjectLog = this.page.getByText(deletedProjectLogText);
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
