import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { waitForToastToBeRemoved } from "../utils";

export class ProjectPage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async deleteProject(projectName: string, withActiveDeployment: boolean = false) {
		if (!projectName?.trim()?.length) {
			throw new Error("Project name is required to delete a project");
		}

		if ((await this.page.getByRole("button", { name: "Edit project title" }).textContent()) !== projectName) {
			throw new Error("Project name is not the same as the one in the page");
		}

		const additionalActionsButton = this.page.locator('button[aria-label="Project additional actions"]');
		await additionalActionsButton.waitFor({ state: "visible", timeout: 3000 });
		await additionalActionsButton.waitFor({ state: "attached", timeout: 1000 });
		await additionalActionsButton.hover();

		const deleteProjectButton = this.page.locator('button[aria-label="Delete project"]');
		await deleteProjectButton.waitFor({ state: "visible", timeout: 3000 });
		await deleteProjectButton.click();
		if (withActiveDeployment) {
			await this.page.locator('button[aria-label="Delete"]').click();
		} else {
			await this.page.locator('button[aria-label="Ok"]').click();
		}
		await waitForToastToBeRemoved(this.page, "Project deletion completed successfully");

		try {
			await Promise.race([
				this.page.waitForURL("/welcome", { waitUntil: "domcontentloaded" }),
				this.page.waitForURL("/", { waitUntil: "domcontentloaded" }),
			]);
		} catch {
			throw new Error('Neither "/welcome" nor "/" URL was reached after project deletion');
		}

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

		await waitForToastToBeRemoved(this.page, "Deployment deactivated successfully");

		const deploymentTableRow = this.page.getByRole("cell", { name: "inactive" });
		await expect(deploymentTableRow).toHaveCount(1);
	}
}
