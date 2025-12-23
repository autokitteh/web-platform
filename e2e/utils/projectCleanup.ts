import type { Page } from "@playwright/test";

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

		if (hasActiveDeployment) {
			await page.locator('button[aria-label="Delete"]').click();
		} else {
			await page.locator('button[aria-label="Ok"]').click();
		}

		await Promise.race([
			page.waitForURL("/welcome", { timeout: 10000 }),
			page.waitForURL("/", { timeout: 10000 }),
		]).catch(() => {});
	} catch {
		// Graceful cleanup - don't fail tests if cleanup encounters issues
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

		const projectNameElement = page.getByRole("button", { name: "Edit project title" });
		const projectName = await projectNameElement.textContent().catch(() => null);

		if (projectName) {
			await deleteProjectByName(page, projectName, hasActiveDeployment);
		}
	} catch {
		// Graceful cleanup - don't fail tests if cleanup encounters issues
	}
}
