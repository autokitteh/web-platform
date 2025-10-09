import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { BasePage } from "./basePage";
import { waitForToast } from "e2e/utils";

export class ProjectPage extends BasePage {
	constructor(page: Page) {
		super(page);
	}

	async deleteProject(projectName: string) {
		await this.hover('button[aria-label="Project additional actions"]');
		await this.click('button[aria-label="Delete project"]');
		await this.click('button[aria-label="Ok"]');
		const successToast = await waitForToast(this.page, "Project deletion completed successfully");
		await expect(successToast).toBeVisible();

		const loaders = this.page.locator(".loader-cycle-disks").all();
		const loadersArray = await loaders;
		await Promise.all(loadersArray.map((loader) => loader.waitFor({ state: "detached" })));

		await this.page.getByRole("heading", { name: /^Welcome to .+$/, level: 1 }).isVisible();

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
		await this.click('button[aria-label="Deployments"]');
		await this.click('button[aria-label="Deactivate deployment"]');

		const toast = await waitForToast(this.page, "Deployment deactivated successfully");
		await expect(toast).toBeVisible();

		const deploymentTableRow = this.page.getByRole("cell", { name: "inactive" });
		await expect(deploymentTableRow).toHaveCount(1);
	}
}
