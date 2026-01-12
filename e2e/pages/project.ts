import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { waitForToastToBeRemoved } from "../utils/waitForToast";

export class ProjectPage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async getCurrentProjectName(): Promise<string> {
		const projectNameElement = this.page.getByTestId("project-name");
		await projectNameElement.waitFor({ state: "visible", timeout: 3000 });
		return (await projectNameElement.textContent()) || "";
	}

	async deleteProject(projectName: string, withActiveDeployment: boolean = false) {
		if (!projectName?.trim()?.length) {
			throw new Error("Project name is required to delete a project");
		}

		const currentProjectName = await this.getCurrentProjectName();
		if (currentProjectName !== projectName) {
			throw new Error(`Project name mismatch. Expected: ${projectName}, Got: ${currentProjectName}`);
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

	async deployProject() {
		await this.page.getByRole("button", { name: "Deploy project" }).click();
		await this.page.waitForTimeout(800);
		await this.page.mouse.move(0, 0);
		await this.page.keyboard.press("Escape");

		await waitForToastToBeRemoved(this.page, "Deployment activated successfully");
		await waitForToastToBeRemoved(this.page, "Project successfully deployed with 1 warning");

		await expect(this.page.getByRole("button", { name: "Sessions", exact: true })).toBeEnabled();
	}
}
