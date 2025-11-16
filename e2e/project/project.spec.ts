import { expect, test } from "../fixtures";

test.describe("Project Suite", () => {
	let projectName: string;
	test.beforeEach(async ({ dashboardPage }) => {
		projectName = await dashboardPage.createProjectFromMenu();
	});

	test("Change project name", async ({ page }) => {
		await page.getByText(projectName).hover();
		await page.getByText(projectName).click();
		const input = page.getByRole("textbox", { name: "Rename" });
		await input.fill("NewProjectName");
		await input.press("Enter");

		await expect(page.getByText("NewProjectName")).toBeVisible();
	});

	test("Create new file to project", async ({ page }) => {
		await page.locator('button[aria-label="Create new file"]').click();
		await page.getByRole("textbox", { name: "new file name" }).click();
		await page.getByRole("textbox", { name: "new file name" }).fill("newFile");
		await page.getByRole("button", { name: "Create", exact: true }).click();
		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();
	});
});
