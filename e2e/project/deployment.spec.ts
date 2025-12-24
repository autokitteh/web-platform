import { expect, test } from "../fixtures";
import { cleanupCurrentProject } from "../utils";

test.describe("Project Deployment Suite", () => {
	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		await page.locator('button[aria-label="Deploy project"]').click();
		await page.mouse.move(0, 0);
		await page.keyboard.press("Escape");
		await page.waitForTimeout(800);

		await expect(page.getByRole("button", { name: "Sessions", exact: true })).toBeEnabled();

		await page.locator('button[aria-label="Deployments"]').click();
		await expect(page.getByText("Deployment History")).toBeVisible();
		await page.locator('button[aria-label="Close Project Settings"]').click();
	});

	test.afterEach(async ({ page }) => {
		await cleanupCurrentProject(page);
	});

	test("New deployment has been created", async ({ page }) => {
		await expect(page.getByText("Deployment History")).toBeVisible();
		await expect(page.getByText("Active").first()).toBeVisible();
	});

	test("Deactivate deployment", async ({ page }) => {
		const deactivateButton = page.locator('button[aria-label="Deactivate deployment"]');
		await deactivateButton.click();
		await expect(page.locator('button[aria-label="Activate deployment"]')).toBeVisible();
		await expect(page.getByText("Inactive").first()).toBeVisible();
	});

	test("Delete activated deployment", async ({ page }) => {
		const deleteButton = page.locator('button[aria-label="Delete deployment"]');
		await expect(deleteButton).toBeDisabled();
	});

	test("Delete deactivated deployment", async ({ page }) => {
		const deactivateButton = page.locator('button[aria-label="Deactivate deployment"]');
		await deactivateButton.click();
		const deleteButton = page.locator('button[aria-label="Delete deployment"]');
		await deleteButton.click();

		await page.locator('button[aria-label="Ok"]').click();
		await expect(deleteButton).not.toBeVisible();
		await expect(page.getByText("No deployments found")).toBeVisible();
	});
});
