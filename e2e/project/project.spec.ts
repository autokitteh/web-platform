import type { Page } from "@playwright/test";
import randomatic from "randomatic";

import { expect, test } from "../fixtures";
import { cleanupCurrentProject, waitForToastToBeRemoved } from "../utils";

async function getProjectNameViaRenameInput(page: Page): Promise<string> {
	const projectNameElement = page.getByTestId("project-name");
	await projectNameElement.hover();
	await projectNameElement.click();

	const input = page.getByRole("textbox", { name: "Rename" });
	await expect(input).toBeVisible();

	const currentName = await input.inputValue();

	await page.keyboard.press("Escape");

	return currentName;
}

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
		await expect(input).toBeVisible();
		await input.fill("NewProjectName");
		await input.press("Enter");

		await expect(page.getByText("NewProjectName")).toBeVisible();
	});
});

test.describe("Project Template and Export Suite", () => {
	let projectName: string;

	test.beforeEach(async ({ dashboardPage }) => {
		projectName = `test_${randomatic("Aa", 8)}`;
		await dashboardPage.createProjectFromTemplate(projectName);
	});

	test.afterEach(async ({ page }) => {
		await cleanupCurrentProject(page);
	});

	test("Export project from HTTP sample template", async ({ page }) => {
		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();

		const downloadPromise = page.waitForEvent("download");

		const additionalActionsButton = page.locator('button[aria-label="Project additional actions"]');
		await additionalActionsButton.waitFor({ state: "visible", timeout: 3000 });
		await additionalActionsButton.hover();

		const exportButton = page.locator('button[aria-label="Export"]');
		await exportButton.waitFor({ state: "visible", timeout: 3000 });
		await exportButton.click();

		const download = await downloadPromise;
		const suggestedFilename = download.suggestedFilename();

		expect(suggestedFilename).toMatch(/.*\.zip$/);
		expect(suggestedFilename).toContain(projectName);

		await waitForToastToBeRemoved(page, "Project exported successfully");
	});

	test("Export and re-import project", async ({ page, projectPage }) => {
		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();

		const configSidebar = page.getByTestId("project-sidebar-config");
		await expect(configSidebar).toBeVisible();

		// const triggerItems = await configSidebar.locator('[data-testid^="trigger-item-"]').all();
		// const originalTriggerNames = await Promise.all(
		// 	triggerItems.map(async (item) => {
		// 		const testId = await item.getAttribute("data-testid");
		// 		return testId?.replace("trigger-item-", "") || "";
		// 	})
		// );

		const variableItems = await configSidebar.locator('[data-testid^="variable-item-"]').all();
		const originalVariableNames = await Promise.all(
			variableItems.map(async (item) => {
				const testId = await item.getAttribute("data-testid");
				return testId?.replace("variable-item-", "") || "";
			})
		);

		// expect(originalTriggerNames.length).toBeGreaterThan(0);

		const downloadPromise = page.waitForEvent("download");

		const additionalActionsButton = page.locator('button[aria-label="Project additional actions"]');
		await additionalActionsButton.waitFor({ state: "visible", timeout: 3000 });
		await additionalActionsButton.hover();

		const exportButton = page.locator('button[aria-label="Export"]');
		await exportButton.waitFor({ state: "visible", timeout: 3000 });
		await exportButton.click();

		const download = await downloadPromise;
		const suggestedFilename = download.suggestedFilename();

		expect(suggestedFilename).toMatch(/.*\.zip$/);
		expect(suggestedFilename).toContain(projectName);

		await waitForToastToBeRemoved(page, "Project exported successfully");

		const filePath = await download.path();
		expect(filePath).toBeTruthy();

		await projectPage.deleteProject(projectName);

		await page.goto("/welcome");
		await expect(page.getByRole("button", { name: "Import project from archive", exact: true })).toBeVisible();

		const fileInputLocator = page.locator('input[data-testid="import-project-file-input"]');
		await expect(fileInputLocator).toBeAttached();

		await fileInputLocator.setInputFiles(filePath!);

		const importedProjectName = await getProjectNameViaRenameInput(page);
		expect(importedProjectName).toBe(projectName);

		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();

		const importedConfigSidebar = page.getByTestId("project-sidebar-config");
		await expect(importedConfigSidebar).toBeVisible();

		// for (const triggerName of originalTriggerNames) {
		// 	const importedTrigger = importedConfigSidebar.locator(`[data-testid="trigger-item-${triggerName}"]`);
		// 	await expect(importedTrigger).toBeVisible();
		// }

		for (const variableName of originalVariableNames) {
			const variableInfoButton = page.locator(`button[aria-label='Variable information for "${variableName}"']`);
			await variableInfoButton.hover();
			await expect(variableInfoButton).toBeVisible();
		}

		await page.goto("/");

		await page.getByRole("cell", { name: importedProjectName }).waitFor({ state: "visible", timeout: 5000 });
		await expect(page.getByRole("cell", { name: importedProjectName })).toBeVisible();
	});

	test("Export and auto-import project with same name", async ({ page, projectPage }) => {
		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();

		const downloadPromise = page.waitForEvent("download");

		const additionalActionsButton = page.locator('button[aria-label="Project additional actions"]');
		await additionalActionsButton.waitFor({ state: "visible", timeout: 3000 });
		await additionalActionsButton.hover();

		const exportButton = page.locator('button[aria-label="Export"]');
		await exportButton.waitFor({ state: "visible", timeout: 3000 });
		await exportButton.click();

		const download = await downloadPromise;
		const suggestedFilename = download.suggestedFilename();

		expect(suggestedFilename).toMatch(/.*\.zip$/);
		expect(suggestedFilename).toContain(projectName);

		await waitForToastToBeRemoved(page, "Project exported successfully");

		const filePath = await download.path();
		expect(filePath).toBeTruthy();

		await projectPage.deleteProject(projectName);

		await page.goto("/welcome");
		await expect(page.getByRole("button", { name: "Import project from archive", exact: true })).toBeVisible();

		const fileInputLocator = page.locator('input[data-testid="import-project-file-input"]');
		await expect(fileInputLocator).toBeAttached();

		await fileInputLocator.setInputFiles(filePath!);

		await waitForToastToBeRemoved(page, "Project created successfully");

		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();

		const projectUrlPattern = new RegExp(`/projects/[^/]+`);
		expect(page.url()).toMatch(projectUrlPattern);

		const importedProjectName = await getProjectNameViaRenameInput(page);
		expect(importedProjectName).toBe(projectName);
	});
});

test.describe("Project Import Suite - All Import Locations", () => {
	let projectName: string;
	let exportedFilePath: string | null;

	test.beforeEach(async ({ dashboardPage, page, projectPage }) => {
		projectName = `test_${randomatic("Aa", 8)}`;
		await dashboardPage.createProjectFromTemplate(projectName);

		// Export the project for reuse in all import tests
		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();

		const downloadPromise = page.waitForEvent("download");

		const additionalActionsButton = page.locator('button[aria-label="Project additional actions"]');
		await additionalActionsButton.waitFor({ state: "visible", timeout: 3000 });
		await additionalActionsButton.hover();

		const exportButton = page.locator('button[aria-label="Export"]');
		await exportButton.waitFor({ state: "visible", timeout: 3000 });
		await exportButton.click();

		const download = await downloadPromise;
		exportedFilePath = await download.path();

		await waitForToastToBeRemoved(page, "Project exported successfully");

		// Delete the original project
		await projectPage.deleteProject(projectName);
	});

	test.afterEach(async ({ page }) => {
		await cleanupCurrentProject(page);
	});

	test("Import project from Welcome page", async ({ page }) => {
		await page.goto("/welcome");
		// Button text is "Import Project" based on welcomeCards constant
		await expect(page.getByRole("button", { name: "Import Project" })).toBeVisible();

		const fileInputLocator = page.locator('input[data-testid="import-project-file-input"]');
		await expect(fileInputLocator).toBeAttached();

		await fileInputLocator.setInputFiles(exportedFilePath!);

		await waitForToastToBeRemoved(page, "Project created successfully");

		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();

		const importedProjectName = await getProjectNameViaRenameInput(page);
		expect(importedProjectName).toBe(projectName);
	});

	test("Import project from Dashboard topbar", async ({ page }) => {
		await page.goto("/");

		// aria-label and title are "Import" based on dashboard topbar implementation
		const importButton = page.locator('button[aria-label="Import"]').first();
		await importButton.waitFor({ state: "visible", timeout: 3000 });

		const fileInputLocator = page.locator('input[data-testid="import-project-file-input"]');
		await expect(fileInputLocator).toBeAttached();

		await fileInputLocator.setInputFiles(exportedFilePath!);

		await waitForToastToBeRemoved(page, "Project created successfully");

		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();

		const importedProjectName = await getProjectNameViaRenameInput(page);
		expect(importedProjectName).toBe(projectName);
	});

	test("Import project from Projects table header", async ({ page }) => {
		await page.goto("/");

		// Wait for the projects table to load
		await page.waitForSelector('h2:has-text("Projects")', { state: "visible" });

		// aria-label and title are "Import" based on projectsTable implementation
		const importButton = page.locator('button[aria-label="Import"]').last();
		await importButton.waitFor({ state: "visible", timeout: 3000 });

		const fileInputLocator = page.locator('input[data-testid="import-project-file-input"]');
		await expect(fileInputLocator).toBeAttached();

		await fileInputLocator.setInputFiles(exportedFilePath!);

		await waitForToastToBeRemoved(page, "Project created successfully");

		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();

		const importedProjectName = await getProjectNameViaRenameInput(page);
		expect(importedProjectName).toBe(projectName);
	});

	test("Import project from AI landing page", async ({ page }) => {
		await page.goto("/ai");

		const importButton = page.locator('button[aria-label="Import project from archive"]');
		await importButton.waitFor({ state: "visible", timeout: 3000 });

		const fileInputLocator = page.locator('input[data-testid="import-project-file-input"]');
		await expect(fileInputLocator).toBeAttached();

		await fileInputLocator.setInputFiles(exportedFilePath!);

		await waitForToastToBeRemoved(page, "Project created successfully");

		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();

		const importedProjectName = await getProjectNameViaRenameInput(page);
		expect(importedProjectName).toBe(projectName);
	});
});
