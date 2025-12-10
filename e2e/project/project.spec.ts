import { expect, test } from "../fixtures";
import { ProjectPage } from "../pages/project";

test.describe("Project Suite", () => {
	let projectName: string;
	let projectId: string;

	test.beforeEach(async ({ dashboardPage, page }) => {
		projectName = await dashboardPage.createProjectFromMenu();
		projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";
		await page.goto(`/projects/${projectId}`);
	});

	test.afterEach(async ({ page }) => {
		const projectPage = new ProjectPage(page);
		const deploymentExists = await page.locator('button[aria-label="Sessions"]').isEnabled();
		await projectPage.deleteProject(projectName, !!deploymentExists);
	});

	test("Change project name", async ({ page }) => {
		await page.getByText(projectName).hover();
		await page.getByText(projectName).click();
		const input = page.getByRole("textbox", { name: "Rename" });
		await input.fill("NewProjectName");
		await input.press("Enter");

		await expect(page.getByText("NewProjectName")).toBeVisible();
		projectName = "NewProjectName";
	});
});
