import { Page } from "playwright/test";

import { expect, test } from "../fixtures";
import { DashboardPage } from "../pages/dashboard";
import { ProjectPage } from "../pages/project";
import { waitForToastToBeRemoved } from "../utils";
import { getItemId } from "@src/utilities/generateItemIds.utils";

const varName = "nameVariable";
const varTestName = "testVariable";
const varTestValue = "testValue";
const newValueVariable = "newValueVariable";
const varTestNameNoDesc = "testVariableNoDesc";

let projectId: string;
let projectName: string;

const createVariable = async ({
	page,
	name,
	value,
	description,
	activeDeployment = false,
}: {
	activeDeployment?: boolean;
	description?: string;
	name: string;
	page: Page;
	value: string;
}) => {
	await page.locator('button[aria-label="Add Variables"]').click();
	if (activeDeployment) {
		await page.locator('button[aria-label="Ok"]').click();
	}
	await page.getByLabel("Name", { exact: true }).fill(name);
	if (description) {
		await page.getByLabel("Description").fill(description);
	}
	await page.getByLabel("Value").fill(value);
	await page.getByRole("button", { name: "Save", exact: true }).click();
	await waitForToastToBeRemoved(page, "Variable created successfully");
};

const openConfigurationSidebar = async (page: Page) => {
	const configureButton = page.locator('button[aria-label="Config"]');
	await configureButton.click();
	try {
		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();
	} catch {
		// fallback to click on the config button to open the configure sidebar in case of flakiness
		await configureButton.click();
		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();
	}
};
test.describe("Project Variables Suite", () => {
	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		const dashboardPage = new DashboardPage(page);
		projectName = await dashboardPage.createProjectFromMenu();

		projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";

		await context.close();
	});

	test.beforeEach(async ({ page }) => {
		await page.goto(`/projects/${projectId}/explorer/settings`);
	});

	test.afterEach(async ({ page }) => {
		await openConfigurationSidebar(page);
	});

	test.afterAll(async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		await page.goto(`/projects/${projectId}/explorer`);

		await openConfigurationSidebar(page);

		if (projectName?.trim().length) {
			const projectPage = new ProjectPage(page);
			await projectPage.deleteProject(projectName, true);
		}

		await context.close();
	});

	test("Create a valid variable", async ({ page }) => {
		await page.locator('button[aria-label="Add Variables"]').click();

		await page.getByLabel("Name", { exact: true }).click();
		await page.getByLabel("Name", { exact: true }).fill(varName);
		await page.getByLabel("Value", { exact: true }).click();
		await page.getByLabel("Value").fill("valueVariable");
		await page.locator('button[aria-label="Save"]').click();

		await waitForToastToBeRemoved(page, "Variable created successfully");
	});

	test("Create variable with empty fields", async ({ page }) => {
		await page.locator('button[aria-label="Add Variables"]').click();
		await page.locator('button[aria-label="Save"]').click();

		const nameErrorMessage = page.getByRole("alert", { name: "Name is required" });
		await expect(nameErrorMessage).toBeVisible();
		const backButton = page.getByRole("button", { name: "Close Add new" });
		await expect(backButton).toBeVisible();
		await backButton.click();
	});

	test("Create variable with description", async ({ page }) => {
		await page.locator('button[aria-label="Add Variables"]').click();

		await page.getByLabel("Name", { exact: true }).click();
		await page.getByLabel("Name", { exact: true }).fill(varTestName);
		await page.getByLabel("Description").click();
		await page.getByLabel("Description").fill("This is a test variable description");
		await page.getByLabel("Value").click();
		await page.getByLabel("Value").fill(varTestValue);
		await page.getByRole("button", { name: "Save", exact: true }).click();

		await waitForToastToBeRemoved(page, "Variable created successfully");
	});

	test("Create variable without description", async ({ page }) => {
		await page.locator('button[aria-label="Add Variables"]').click();

		await page.getByLabel("Name", { exact: true }).click();
		await page.getByLabel("Name", { exact: true }).fill(varTestNameNoDesc);
		await page.getByLabel("Value").click();
		await page.getByLabel("Value").fill("testValue");
		await page.getByRole("button", { name: "Save", exact: true }).click();

		await waitForToastToBeRemoved(page, "Variable created successfully");
	});

	test("Modify variable", async ({ page }) => {
		const testVarName = "modifyTestVar";
		const testVarValue = "initialValue";
		await createVariable({ page, name: testVarName, value: testVarValue });

		const configureButtonId = getItemId(testVarName, "variable", "configureButtonId");
		const configureButton = page.locator(`button[id="${configureButtonId}"]`);
		await configureButton.click();

		const valueInput = page.getByLabel("Value", { exact: true });

		await valueInput.fill(newValueVariable);
		const value = await valueInput.inputValue();
		expect(value).toEqual(newValueVariable);

		await page.locator('button[aria-label="Save"]').click();
		await page.waitForURL(/\/projects\/[^/]+\/explorer\/settings/);
		await page.locator(`button[aria-label='Variable information for "${testVarName}"']`).hover();

		await expect(page.getByText(newValueVariable)).toBeVisible();

		await page.keyboard.press("Escape");
		await expect(page.getByText(newValueVariable)).not.toBeVisible();
	});

	test("Modify variable description", async ({ page }) => {
		const testVarName = "descTestVar";
		await createVariable({ page, name: testVarName, value: "someValue", description: "Initial description" });

		const configureButtonId = getItemId(testVarName, "variable", "configureButtonId");
		const configureButton = page.locator(`button[id="${configureButtonId}"]`);
		await configureButton.click();

		await page.getByLabel("Description").click();
		await page.getByLabel("Description").fill("Updated description text");
		await page.locator('button[aria-label="Save"]').click();

		await waitForToastToBeRemoved(page, "Variable edited successfully");
		await page.locator(`button[aria-label='Variable information for "${testVarName}"']`).hover();
		await expect(page.getByText("Updated description text")).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(page.getByText("Updated description text")).not.toBeVisible();
	});

	test("Modifying variable with empty value", async ({ page }) => {
		const testVarName = "emptyValVar";
		await createVariable({ page, name: testVarName, value: "initialValue" });

		const configureButtonId = getItemId(testVarName, "variable", "configureButtonId");
		const configureButton = page.locator(`button[id="${configureButtonId}"]`);
		await configureButton.click();

		await page.getByRole("textbox", { name: "Value", exact: true }).clear();
		await expect(page.getByRole("textbox", { name: "Value", exact: true })).toBeEmpty();

		await page.locator('button[aria-label="Save"]').click();

		await page.locator(`button[aria-label='Variable information for "${testVarName}"']`).hover();
		await expect(page.getByText("No value set")).toBeVisible();
	});

	test("Modify variable with active deployment", async ({ page }) => {
		const testVarName = "deployTestVar";
		await createVariable({ page, name: testVarName, value: "initialValue" });

		const deployButton = page.locator('button[aria-label="Deploy project"]');
		await deployButton.click();

		const deploymentToast = page
			.locator('[role="alert"]')
			.filter({ hasText: /Project (successfully deployed|deployment completed)/ });
		await expect(deploymentToast).toBeVisible({ timeout: 10000 });
		await deploymentToast.waitFor({ state: "hidden", timeout: 10000 });

		const configureButtonId = getItemId(testVarName, "variable", "configureButtonId");
		const configureButton = page.locator(`button[id="${configureButtonId}"]`);
		await configureButton.click();

		await page.locator('heading[aria-label="Warning Active Deployment"]').isVisible();
		const okButton = page.locator('button[aria-label="Ok"]');
		await okButton.isVisible();
		await okButton.click();

		await expect(page.getByText("Changes might affect the currently running deployments.")).toBeVisible();

		await page.getByLabel("Value", { exact: true }).click();
		await page.getByLabel("Value").fill(newValueVariable);
		await page.locator('button[aria-label="Save"]').click();
		await page.waitForURL(/\/projects\/[^/]+\/explorer\/settings/);
		await waitForToastToBeRemoved(page, "Variable edited successfully");

		await page.locator(`button[aria-label='Variable information for "${testVarName}"']`).hover();
		await expect(page.getByText(newValueVariable)).toBeVisible();
		await page.mouse.move(0, 0);
		await expect(page.getByText(newValueVariable)).not.toBeVisible();
	});

	test("Delete variable", async ({ page }) => {
		const testVarName = "deleteTestVar";
		await createVariable({ page, name: testVarName, value: "toBeDeleted", activeDeployment: true });

		const deleteVarButton = page.getByRole("button", { name: `Delete ${testVarName}` });
		await deleteVarButton.click();

		await expect(page.getByText("Changes might affect the currently running deployments.")).toBeVisible();

		const agreeWithDeployment = page.getByRole("button", { name: "Ok" });
		await agreeWithDeployment.click();

		const confirmButton = page.getByRole("button", { name: `Confirm and delete ${testVarName}` });
		await confirmButton.click();

		await waitForToastToBeRemoved(page, `${testVarName} removed successfully`);
		await expect(page.getByText(testVarName, { exact: true })).not.toBeVisible();
	});
});
