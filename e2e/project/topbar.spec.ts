import { expect, test } from "../fixtures";

test.describe("Project Topbar Suite", () => {
	test("Changed deployments topbar", async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();

		await expect(page.locator('button[aria-label="Explorer"]')).toHaveClass(/active/);
		await expect(page.locator('button[aria-label="Deployments"]')).not.toHaveClass(/active/);
		await expect(page.locator('button[aria-label="Sessions"]')).toBeDisabled();
		await page.locator('button[aria-label="Close Project Settings"]').click();

		const deployButton = page.locator('button[aria-label="Deploy project"]');
		await deployButton.click();

		await page.locator('button[aria-label="Deployments"]').click();

		await expect(page.locator('button[aria-label="Explorer"]')).not.toHaveClass(/active/);
		await expect(page.locator('button[aria-label="Deployments"]')).toHaveClass(/active/);

		const activeStatus = page.getByText("Active").first();
		await activeStatus.click();

		await expect(page.locator('button[aria-label="Explorer"]')).not.toHaveClass(/active/);
		await expect(page.locator('button[aria-label="Deployments"]')).not.toHaveClass(/active/);
		await expect(page.locator('button[aria-label="Sessions"]')).toHaveClass(/active/);
	});
});
