import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
	const button = page.getByRole("button", { name: "New Project" });
	await button.hover();
	await button.click();
	await expect(page.getByRole("link", { name: "View project stats" })).toBeVisible();
	await expect(page.getByRole("link", { name: "View project stats" })).not.toBeDisabled();
});

test.describe("Project Topbar Suite", () => {
	test("Changed deployments topbar", async ({ page }) => {
		await page.getByRole("link", { name: "View project stats" }).click();
		await expect(page.getByRole("link", { name: "Go to project" })).toBeVisible();
	});
});
