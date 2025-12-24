import type { Page } from "@playwright/test";

import { expect, test } from "../../fixtures";
import { waitForToastToBeRemoved } from "../../utils";

const triggerName = "entryFunctionTest";

async function startTriggerCreation(page: Page, name: string, triggerType: string, isDeployed?: boolean) {
	const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
	await addTriggersButton.hover();
	await addTriggersButton.click();

	if (isDeployed) {
		await expect(page.getByText("Changes might affect the currently running deployments.")).toBeVisible();

		const okButton = await page.getByRole("button", { name: "Ok", exact: true });
		await okButton.click();
	}

	const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
	await nameInput.click();
	await nameInput.fill(name);

	await page.getByTestId("select-trigger-type-empty").click();
	await page.getByRole("option", { name: triggerType }).click();
}

async function selectFile(page: Page, fileName: string) {
	await page.getByTestId("select-file-empty").click();
	await page.getByRole("option", { name: fileName }).click();
}

async function clearFileSelection(page: Page) {
	const fileSelectContainer = page.locator('[data-testid^="select-file-"][data-testid$="-selected"]');
	const clearButton = fileSelectContainer.locator(".react-select__clear-indicator");
	await clearButton.click();
}

async function createCustomEntryFunction(page: Page, functionName: string) {
	const input = page.getByRole("combobox", { name: "Function name" });
	await input.fill(functionName);

	// eslint-disable-next-line security/detect-non-literal-regexp
	const createOption = page.getByRole("option", { name: new RegExp(`Use.*${functionName}`, "i") });
	await createOption.click();
}

async function clearEntryFunctionSelection(page: Page) {
	const entryFunctionContainer = page.locator('[data-testid^="select-entry-function-"][data-testid$="-selected"]');
	const clearButton = entryFunctionContainer.locator(".react-select__clear-indicator");
	await clearButton.click();
}

test.describe("Trigger Entry Function SelectCreatable Suite", () => {
	test.beforeEach(async ({ dashboardPage }) => {
		await dashboardPage.createProjectFromMenu();
	});

	test("Entry function select shows placeholder when empty", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		const entryFunctionSelect = page.getByTestId("select-entry-function-empty");
		await expect(entryFunctionSelect).toBeVisible();

		const placeholder = entryFunctionSelect.locator(".react-select__placeholder");
		await expect(placeholder).toBeVisible();
	});

	test("Entry function select shows available functions after file selection and deployment", async ({ page }) => {
		await page.getByRole("button", { name: "Deploy project" }).click();
		await page.waitForTimeout(800);
		await page.mouse.move(0, 0);
		await page.keyboard.press("Escape");

		await expect(page.getByRole("button", { name: "Sessions", exact: true })).toBeEnabled();

		await startTriggerCreation(page, triggerName, "Scheduler", true);

		await selectFile(page, "program.py");

		const entryFunctionSelect = page.getByTestId("select-entry-function-empty");
		await entryFunctionSelect.click();

		const optionsList = page.locator(".react-select__menu");
		await expect(optionsList).toBeVisible();

		const options = page.locator(".react-select__option");
		const optionCount = await options.count();
		expect(optionCount).toBeGreaterThanOrEqual(1);
	});

	test("Can create custom entry function name", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");
		await selectFile(page, "program.py");

		await createCustomEntryFunction(page, "my_custom_function");

		const selectedValue = page.locator('[data-testid^="select-entry-function-"][data-testid$="-selected"]');
		await expect(selectedValue).toBeVisible();

		const valueText = selectedValue.locator(".react-select__single-value");
		await expect(valueText).toContainText("my_custom_function");
	});

	test("Clear button appears on entry function select when value is selected", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");
		await selectFile(page, "program.py");

		const entryFunctionEmpty = page.getByTestId("select-entry-function-empty");
		const clearButtonBefore = entryFunctionEmpty.locator(".react-select__clear-indicator");
		await expect(clearButtonBefore).not.toBeVisible();

		await createCustomEntryFunction(page, "test_function");

		const entryFunctionSelected = page.locator('[data-testid^="select-entry-function-"][data-testid$="-selected"]');
		const clearButtonAfter = entryFunctionSelected.locator(".react-select__clear-indicator");
		await expect(clearButtonAfter).toBeVisible();
	});

	test("Clearing entry function selection removes the value", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");
		await selectFile(page, "program.py");
		await createCustomEntryFunction(page, "test_function");

		const selectedValue = page.locator('[data-testid^="select-entry-function-"][data-testid$="-selected"]');
		await expect(selectedValue).toBeVisible();

		await clearEntryFunctionSelection(page);

		const emptySelect = page.getByTestId("select-entry-function-empty");
		await expect(emptySelect).toBeVisible();
	});

	test("Entry function is cleared when file selection is cleared", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");
		await selectFile(page, "program.py");
		await createCustomEntryFunction(page, "test_function");

		const entryFunctionSelected = page.locator('[data-testid^="select-entry-function-"][data-testid$="-selected"]');
		await expect(entryFunctionSelected).toBeVisible();

		await clearFileSelection(page);

		const entryFunctionEmpty = page.getByTestId("select-entry-function-empty");
		await expect(entryFunctionEmpty).toBeVisible();
	});

	test("Can re-select entry function after clearing", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");
		await selectFile(page, "program.py");
		await createCustomEntryFunction(page, "first_function");

		await clearEntryFunctionSelection(page);

		await createCustomEntryFunction(page, "second_function");

		const selectedValue = page.locator('[data-testid^="select-entry-function-"][data-testid$="-selected"]');
		await expect(selectedValue).toBeVisible();

		const valueText = selectedValue.locator(".react-select__single-value");
		await expect(valueText).toContainText("second_function");
	});

	test("Full workflow: select file, create function, save trigger", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("0 9 * * *");

		await selectFile(page, "program.py");
		await createCustomEntryFunction(page, "my_handler");

		await page.locator('button[aria-label="Save"]').click();

		await waitForToastToBeRemoved(page, "Trigger created successfully");
	});

	test("Validation error when entry function is empty for scheduler", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("0 9 * * *");

		await selectFile(page, "program.py");

		await page.locator('button[aria-label="Save"]').click();

		const errorMessage = page.locator("text=/.*function.*required.*/i");
		await expect(errorMessage).toBeVisible();
	});

	test("Entry function persists after re-selecting the same file", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");
		await selectFile(page, "program.py");
		await createCustomEntryFunction(page, "persistent_function");

		await clearFileSelection(page);
		await selectFile(page, "program.py");

		const entryFunctionEmpty = page.getByTestId("select-entry-function-empty");
		await expect(entryFunctionEmpty).toBeVisible();
	});

	test("Modify trigger with SelectCreatable entry function", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("0 9 * * *");

		await selectFile(page, "program.py");
		await createCustomEntryFunction(page, "initial_function");

		await page.locator('button[aria-label="Save"]').click();

		await waitForToastToBeRemoved(page, "Trigger created successfully");

		await page.locator('button[aria-label="Return back"]').click();

		const editButton = page.locator(`button[aria-label="Edit ${triggerName}"]`);
		await editButton.click();

		await clearEntryFunctionSelection(page);
		await createCustomEntryFunction(page, "updated_function");

		await page.locator('button[aria-label="Save"]').click();

		await waitForToastToBeRemoved(page, "Trigger updated successfully");

		await page.locator(`button[aria-label='Trigger information for "${triggerName}"']`).hover();

		await expect(page.getByTestId("trigger-detail-entrypoint")).toHaveText("updated_function");
	});
});
