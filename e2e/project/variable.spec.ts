import { expect, test } from "../fixtures";
import { waitForToast } from "../utils";
import { waitForLoadingOverlayGone } from "../utils/waitForLoadingOverlayToDisappear";

const varName = "nameVariable";

let projectId: string;
let projectName: string;

test.beforeEach(async ({ dashboardPage, page }) => {
	projectName = await dashboardPage.createProjectFromMenu();
	projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";

	await page.goto(`/projects/${projectId}/explorer/settings`);
	await waitForLoadingOverlayGone(page);
	await page.locator('button[aria-label="Add Variables"]').click();

	await page.getByLabel("Name", { exact: true }).click();
	await page.getByLabel("Name", { exact: true }).fill("nameVariable");
	await page.getByLabel("Value", { exact: true }).click();
	await page.getByLabel("Value").fill("valueVariable");
	await page.locator('button[aria-label="Save"]').click();

	const toast = await waitForToast(page, "Variable created successfully");
	await expect(toast).toBeVisible();

	const variablesAccordion = page.getByTestId("variables-accordion-button");
	await variablesAccordion.waitFor({ state: "visible", timeout: 1000 });
});

test.afterEach(async ({ page, projectPage }) => {
	await page.goto(`/projects/${projectId}`);

	await page.locator('button[aria-label="Deployments"]').click();
	const deactivateButton = page.locator('button[aria-label="Deactivate deployment"]');
	const isDeploymentActive = await deactivateButton.isVisible({ timeout: 1000 }).catch(() => false);

	if (isDeploymentActive) {
		await deactivateButton.click();
		const toast = page.getByText("Deployment deactivated successfully");
		await expect(toast).toBeVisible();
	}

	await projectPage.deleteProject(projectName);
});

test.describe("Project Variables Suite", () => {
	test("Create variable with empty fields", async ({ page }) => {
		await page.locator('button[aria-label="Add Variables"]').click();
		await page.locator('button[aria-label="Save"]').click();

		const nameErrorMessage = page.getByRole("alert", { name: "Name is required" });
		const valueErrorMessage = page.getByRole("alert", { name: "Value is required" });
		await expect(nameErrorMessage).toBeVisible();
		await expect(valueErrorMessage).toBeVisible();
	});

	test("Create variable with description", async ({ page }) => {
		await page.locator('button[aria-label="Add Variables"]').click();

		await page.getByLabel("Name", { exact: true }).click();
		await page.getByLabel("Name", { exact: true }).fill("testVariable");
		await page.getByLabel("Description").click();
		await page.getByLabel("Description").fill("This is a test variable description");
		await page.getByLabel("Value").click();
		await page.getByLabel("Value").fill("testValue");
		await page.getByRole("button", { name: "Save", exact: true }).click();

		const toast = await waitForToast(page, "Variable created successfully");
		await expect(toast).toBeVisible();
	});

	test("Create variable without description", async ({ page }) => {
		await page.locator('button[aria-label="Add Variables"]').click();

		await page.getByLabel("Name", { exact: true }).click();
		await page.getByLabel("Name", { exact: true }).fill("testVariableNoDesc");
		await page.getByLabel("Value").click();
		await page.getByLabel("Value").fill("testValue");
		await page.getByRole("button", { name: "Save", exact: true }).click();

		const toast = await waitForToast(page, "Variable created successfully");
		await expect(toast).toBeVisible();
	});

	test("Modify variable", async ({ page }) => {
		const configureButtons = page.locator('button[aria-label="Edit"]');
		await configureButtons.first().click();

		const valueInput = page.getByLabel("Value", { exact: true });

		await valueInput.fill("newValueVariable");
		const value = await valueInput.inputValue();
		expect(value).toEqual("newValueVariable");

		await page.locator('button[aria-label="Save"]').click();
		await page.waitForURL(/\/projects\/[^/]+\/explorer\/settings/);
		await page.locator("button[aria-label='Variable information for \"nameVariable\"']").hover();

		await expect(page.getByText("newValueVariable")).toBeVisible();
	});

	test("Modify variable description", async ({ page }) => {
		const configureButtons = page.locator('button[aria-label="Edit"]');
		await configureButtons.first().click();

		await page.getByLabel("Description").click();
		await page.getByLabel("Description").fill("Updated description text");
		await page.locator('button[aria-label="Save"]').click();

		const toast = await waitForToast(page, "Variable edited successfully");
		await expect(toast).toBeVisible();
		await page.locator("button[aria-label='Variable information for \"nameVariable\"']").hover();
		await expect(page.getByText("Updated description text")).toBeVisible();
	});

	test("Modify variable with active deployment", async ({ page }) => {
		const deployButton = page.locator('button[aria-label="Deploy project"]');
		await deployButton.click();

		const toast = await waitForToast(page, "Project successfully deployed with 1 warning");
		await expect(toast).toBeVisible();
		await expect(toast).not.toBeVisible({ timeout: 5000 });

		const configureButton = page.locator('button[id="nameVariable-variable-configure-button"]');
		await configureButton.click();

		const okButton = page.locator('button[aria-label="Ok"]');
		if (await okButton.isVisible()) {
			await okButton.click();
		}

		await page.getByLabel("Value", { exact: true }).click();
		await page.getByLabel("Value").fill("newValueVariable");
		await page.locator('button[aria-label="Save"]').click();
		await page.waitForURL(/\/projects\/[^/]+\/explorer\/settings/);
		await page.locator('button[aria-label="Config"]').click();

		await page.locator("button[aria-label='Variable information for \"nameVariable\"']").hover();
		await expect(page.getByText("newValueVariable")).toBeVisible();
	});

	test("Modifying variable with empty value", async ({ page }) => {
		const configureButtons = page.locator('button[aria-label="Edit"]');
		await configureButtons.first().click();

		await page.getByRole("textbox", { name: "Value", exact: true }).clear();
		await page.locator('button[aria-label="Save"]').click();

		const valueErrorMessage = page.getByRole("alert", { name: "Value is required" });
		await expect(valueErrorMessage).toBeVisible();
	});

	test("Delete variable", async ({ page }) => {
		const deleteButton = page.locator('button[aria-label="Delete nameVariable"]');
		await deleteButton.click();

		const confirmButton = page.locator('button[aria-label="Confirm and delete nameVariable"]');
		await confirmButton.click();
		const toast = await waitForToast(page, "Variable removed successfully");
		await expect(toast).toBeVisible();
		await expect(page.getByText(varName, { exact: true })).not.toBeVisible();

		await expect(page.getByText("No variables found for this project")).toBeVisible();
	});
});
