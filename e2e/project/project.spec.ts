import { test, expect } from "@e2e/fixtures";

test.describe("Project Suite", () => {
	test.beforeEach(async ({ dashboardPage }) => {
		await dashboardPage.createProjectFromMenu();
	});

	test("Change project name", async ({ page }) => {
		await page.getByRole("textbox", { name: "Rename" }).click();
		await page.getByRole("textbox", { name: "Rename" }).fill("Grankie_0121");
		expect(page.getByText("Grankie_0121")).toBeTruthy();
	});

	test("Create new file to project", async ({ page }) => {
		await page.getByRole("button", { name: "Create new file" }).click();
		await page.getByRole("textbox", { name: "new file name" }).click();
		await page.getByRole("textbox", { name: "new file name" }).fill("newFile");
		await page.getByRole("button", { name: "Create", exact: true }).click();
	});
});
