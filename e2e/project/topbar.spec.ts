import { expect, test } from "@e2e/fixtures";

test.beforeEach(async ({ dashboardPage, page }) => {
	await dashboardPage.createProjectFromMenu();
	await expect(page.getByRole("link", { name: "Deployments" })).toBeVisible();
	await expect(page.getByRole("link", { name: "Deployments" })).not.toBeDisabled();
});

test.describe("Project Topbar Suite", () => {
	test("Changed deployments topbar", async ({ page }) => {
		await page.getByRole("link", { name: "Deployments" }).click();
		await expect(page.getByRole("link", { name: "Go to project" })).toBeVisible();
	});
});
