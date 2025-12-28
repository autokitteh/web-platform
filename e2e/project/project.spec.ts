import { expect, test } from "../fixtures";
import { cleanupCurrentProject } from "../utils";

test.describe("Project Suite", () => {
	let projectName: string;

	test.beforeEach(async ({ dashboardPage }) => {
		projectName = await dashboardPage.createProjectFromMenu();
	});

	test.afterEach(async ({ page }) => {
		await cleanupCurrentProject(page);
	});

	test("Change project name", async ({ page }) => {
		await page.getByText(projectName).hover();
		await page.getByText(projectName).click();
		const input = page.getByRole("textbox", { name: "Rename" });
		await input.fill("NewProjectName");
		await input.press("Enter");

		await expect(page.getByText("NewProjectName")).toBeVisible();
	});
});
