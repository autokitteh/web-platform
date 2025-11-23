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

		let successToast;
		try {
			successToast = await waitForToast(
				this.page,
				`Close "Success Project deletion completed successfully" toast`
			);
			if (await successToast.isVisible()) {
				await successToast
					.locator("button[aria-label=\"Close 'Project deletion completed successfully' toast\"]")
					.click();
			} else {
				// eslint-disable-next-line no-console
				console.warn("Success toast was found but is not visible. Continuing test without closing toast.");
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.warn(
				`Success toast not found: ${error instanceof Error ? error.message : String(error)}. Continuing test without closing toast.`
			);
		}

		await this.page.mouse.move(0, 0);

		const loaders = this.page.locator(".loader-cycle-disks").all();
		const loadersArray = await loaders;
		await Promise.all(loadersArray.map((loader) => loader.waitFor({ state: "detached" })));

		if (successToast) {
			await expect(successToast).not.toBeVisible({ timeout: 2000 });
		}

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
