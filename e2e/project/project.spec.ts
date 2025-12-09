import { expect, test } from "../fixtures";
import { DashboardPage } from "../pages/dashboard";

test.describe("Project Suite", () => {
	let projectName: string;
	let projectId: string;

	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		const dashboardPage = new DashboardPage(page);
		projectName = await dashboardPage.createProjectFromMenu();

		projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";

		await context.close();
	});

	test.beforeEach(async ({ page }) => {
		await page.goto(`/projects/${projectId}`);
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
