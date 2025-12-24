import type { Page } from "@playwright/test";

import { expect, test } from "../../fixtures";
import { cleanupCurrentProject } from "../../utils";
import { waitForToastToBeRemoved } from "../../utils/waitForToast";

const triggerName = "clearableTest";

async function startTriggerCreation(page: Page, name: string, triggerType: string) {
	const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
	await addTriggersButton.hover();
	await addTriggersButton.click();

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

async function fillFunctionName(page: Page, functionName: string) {
	const functionNameInput = page.getByRole("textbox", { name: /Function name/i });
	await functionNameInput.click();
	await functionNameInput.fill(functionName);
}

async function clearFileSelection(page: Page) {
	const fileSelectContainer = page.locator('[data-testid^="select-file-"][data-testid$="-selected"]');
	const clearButton = fileSelectContainer.locator(".react-select__clear-indicator");
	await clearButton.click();
}

test.describe("Trigger Clearable Select Suite", () => {
	test.beforeEach(async ({ dashboardPage }) => {
		await dashboardPage.createProjectFromMenu();
	});

	test.afterEach(async ({ page }) => {
		await cleanupCurrentProject(page);
	});

	test("Clear button appears on file select when value is selected", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		const fileSelectContainerEmpty = page.getByTestId("select-file-empty");
		const clearButtonBeforeSelection = fileSelectContainerEmpty.locator(".react-select__clear-indicator");
		await expect(clearButtonBeforeSelection).not.toBeVisible();

		await selectFile(page, "program.py");

		const fileSelectContainerSelected = page.locator('[data-testid^="select-file-"][data-testid$="-selected"]');
		await expect(fileSelectContainerSelected).toBeVisible();
		const clearButtonAfterSelection = fileSelectContainerSelected.locator(".react-select__clear-indicator");
		await expect(clearButtonAfterSelection).toBeVisible();
	});

	test("Clearing file selection removes the selected value", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await selectFile(page, "program.py");

		const selectedValueBefore = page.locator('[data-testid^="select-file-"][data-testid$="-selected"]');
		await expect(selectedValueBefore).toBeVisible();

		await clearFileSelection(page);

		const emptySelect = page.getByTestId("select-file-empty");
		await expect(emptySelect).toBeVisible();
	});

	test("File select placeholder is visible immediately after clearing", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await selectFile(page, "program.py");
		await clearFileSelection(page);

		const fileSelectEmpty = page.getByTestId("select-file-empty");
		await expect(fileSelectEmpty).toBeVisible();
		const placeholderText = fileSelectEmpty.locator(".react-select__placeholder");
		await expect(placeholderText).toBeVisible();
	});

	test("Can re-select file after clearing", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await selectFile(page, "program.py");
		await clearFileSelection(page);

		await selectFile(page, "program.py");

		const selectedValue = page.locator('[data-testid^="select-file-"][data-testid$="-selected"]');
		await expect(selectedValue).toBeVisible();
	});

	test("Full workflow: select, clear, re-select, save trigger", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("0 9 * * *");

		await selectFile(page, "program.py");
		await fillFunctionName(page, "old_function");

		await clearFileSelection(page);

		await selectFile(page, "program.py");
		await fillFunctionName(page, "new_function");

		await page.locator('button[aria-label="Save"]').click();

		await waitForToastToBeRemoved(page, "Trigger created successfully");
	});

	test("Event type select has clear button when connection trigger", async ({ page }) => {
		const connectionsHeader = page.getByText("Connections").first();
		await connectionsHeader.click();

		const modifyConnectionButton = page.locator('button[aria-label*="Modify"][aria-label*="connection"]');
		const connectionsExist = await modifyConnectionButton.isVisible().catch(() => false);

		if (!connectionsExist) {
			test.skip(true, "No connections available for testing event type clear");
			return;
		}

		const triggersHeader = page.getByText("Triggers").first();
		await triggersHeader.click();

		await startTriggerCreation(page, triggerName, "Connection");

		await page.getByTestId("select-connection-empty").click();
		await page.getByRole("option").first().click();

		const eventTypeSelectContainer = page.locator('[data-testid*="Event type"]').first();
		await expect(eventTypeSelectContainer).toBeVisible();

		await eventTypeSelectContainer.click();
		const firstOption = page.getByRole("option").first();
		await firstOption.click();

		const eventTypeSelectWithValue = page.locator('[data-testid*="Event type"][data-testid$="-selected"]');
		const clearButton = eventTypeSelectWithValue.locator(".react-select__clear-indicator");
		await expect(clearButton).toBeVisible();

		await clearButton.click();

		const eventTypeSelectAfterClear = page.locator('[data-testid*="Event type"][data-testid$="-empty"]');
		await expect(eventTypeSelectAfterClear).toBeVisible();
	});
});
