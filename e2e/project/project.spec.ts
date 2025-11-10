import { expect, test } from "../fixtures";

test.describe("Project Suite", () => {
	test.beforeEach(async ({ dashboardPage }) => {
		await dashboardPage.createProjectFromMenu();
	});

	test("Change project name", async ({ page }) => {
		await page.getByRole("button", { name: "Edit project title" }).click();
		const input = page.getByRole("textbox", { name: "Rename" });
		await input.fill("NewProjectName");
		await input.press("Enter");

		await expect(page.getByText("NewProjectName")).toBeVisible();
	});

	test("Create new file to project", async ({ page }) => {
		await page.locator('button[aria-label="Create new file"]').click();
		await page.getByRole("textbox", { name: "new file name" }).click();
		await page.getByRole("textbox", { name: "new file name" }).fill("newFile");
		await page.getByRole("button", { exact: true, name: "Create" }).click();
	});
});
