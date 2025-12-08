import randomatic from "randomatic";

import { expect, test } from "../fixtures";
import { waitForLoadingOverlayGone } from "../utils/waitForLoadingOverlayToDisappear";
import { waitForMonacoEditorToLoad } from "../utils/waitForMonacoEditor";

test.describe("Project Suite", () => {
	let projectName: string;
	let projectId: string;

	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		await waitForLoadingOverlayGone(page);
		await page.goto("/");
		await page.locator('nav[aria-label="Main navigation"] button[aria-label="New Project"]').hover();
		await page.locator('nav[aria-label="Main navigation"] button[aria-label="New Project"]').click();
		await page.getByRole("button", { name: "New Project From Scratch" }).hover();
		await page.getByRole("button", { name: "New Project From Scratch" }).click();
		projectName = randomatic("Aa", 8);
		await page.getByPlaceholder("Enter project name").fill(projectName);
		await page.getByRole("button", { name: "Create", exact: true }).click();
		await expect(page.locator('button[aria-label="Open program.py"]')).toBeVisible();
		await page.getByRole("button", { name: "Open program.py" }).click();

		await expect(page.getByRole("tab", { name: "program.py Close file tab" })).toBeVisible();

		await waitForMonacoEditorToLoad(page, 6000);

		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible({ timeout: 1200 });

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
