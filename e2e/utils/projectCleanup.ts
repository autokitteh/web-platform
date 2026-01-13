/* eslint-disable no-console */
import type { Page } from "@playwright/test";

import { getTestId } from "./test.utils";

export async function deleteProjectByName(page: Page, projectName: string, hasActiveDeployment = false): Promise<void> {
	if (!projectName?.trim()?.length) {
		return;
	}

	try {
		const currentUrl = page.url();
		const projectIdMatch = currentUrl.match(/\/projects\/([^/]+)/);

		if (!projectIdMatch) {
			return;
		}

		const additionalActionsButton = page.locator('button[aria-label="Project additional actions"]');
		const isButtonVisible = await additionalActionsButton.isVisible().catch(() => false);

		if (!isButtonVisible) {
			return;
		}

		await additionalActionsButton.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
		await additionalActionsButton.hover();

		const deleteProjectButton = page.locator('button[aria-label="Delete project"]');
		await deleteProjectButton.waitFor({ state: "visible", timeout: 3000 });
		await deleteProjectButton.click();

		const projectDeleteModalTestId = getTestId.projectDeleteModal(projectName);
		const deleteProjectModal = page.getByTestId(projectDeleteModalTestId);
		await deleteProjectModal.waitFor({ state: "visible", timeout: 3000 });

		if (hasActiveDeployment) {
			await deleteProjectModal.locator('button[aria-label="Delete"]').click();
		} else {
			await deleteProjectModal.locator('button[aria-label="Ok"]').click();
		}

		await Promise.race([
			page.waitForURL("/welcome", { timeout: 10000 }),
			page.waitForURL("/", { timeout: 10000 }),
		]).catch(() => {});

		await page.locator('button[aria-label="System Log"]').click();

		const deletedProjectLogText = `Project deletion completed successfully, project name: ${projectName}`;

		const deletedProjectLog = page.getByText(deletedProjectLogText);
		await deletedProjectLog.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
		await page.locator('button[aria-label="System Log"]').click();
	} catch (error) {
		console.warn("deleteProjectByName cleanup error:", error);
	}
}

export async function cleanupCurrentProject(page: Page): Promise<void> {
	try {
		const currentUrl = page.url();

		if (!currentUrl.includes("/projects/")) {
			return;
		}

		const hasActiveDeployment = await page
			.locator('button[aria-label="Sessions"]')
			.isEnabled()
			.catch(() => false);

		const projectNameElement = page.getByTestId("project-name");
		const projectName = await projectNameElement.textContent().catch(() => null);

		if (projectName) {
			await deleteProjectByName(page, projectName, hasActiveDeployment);
		}
	} catch (error) {
		console.warn("cleanupCurrentProject cleanup error:", error);
	}
}
