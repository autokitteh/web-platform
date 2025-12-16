import { expect, test } from "../fixtures";
import { ProjectPage } from "../pages/project";
import { waitForToastToBeRemoved } from "../utils";
import { randomName } from "../utils/randomName";

test.describe("Project Suite", () => {
	let projectName: string;
	let projectId: string;
	let randomSuffix: string;

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
		randomSuffix = randomName();
		const modifiedProjectName = `proj_${randomSuffix}`;
		await input.fill(modifiedProjectName);
		await input.press("Enter");
		await waitForToastToBeRemoved(page, "Project renamed successfully");
		const projectNameElement = await page.getByRole("button", { name: "Edit project title" });
		await expect(projectNameElement).toBeVisible();
		const projectNameText = await projectNameElement.getByText(modifiedProjectName, { exact: true });
		await expect(projectNameText).toBeVisible();
		projectName = modifiedProjectName;
		await page.locator('button[aria-label="System Log"]').click();

		const renamedProjectLogText = `INFO: Project renamed successfully, project name: ${modifiedProjectName}, project ID: ${projectId}`;
		const renamedProjectLog = page.getByText(renamedProjectLogText, { exact: true });
		await expect(renamedProjectLog).toBeVisible();

		await page.locator('button[aria-label="System Log"]').click();
	});
});
