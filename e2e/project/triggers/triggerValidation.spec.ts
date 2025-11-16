import type { Page } from "@playwright/test";

import { expect, test } from "../../fixtures";
import { waitForToast } from "../../utils";

const triggerName = "testTrigger";

async function startTriggerCreation(page: Page, name: string, triggerType: string) {
	const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
	await addTriggersButton.hover();

	await addTriggersButton.click();

	const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
	await nameInput.click();
	await nameInput.fill(name);

	await page.getByTestId("select-trigger-type").click();
	await page.getByRole("option", { name: triggerType }).click();
}

async function attemptSaveTrigger(page: Page, shouldSucceed: boolean = true) {
	const saveButton = page.locator('button[aria-label="Save"]');
	await saveButton.click();

	if (shouldSucceed) {
		const toast = await waitForToast(page, "Trigger created successfully");
		await expect(toast).toBeVisible();

		const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
		await expect(nameInput).toBeDisabled();
	}
}

async function fillFileAndFunction(page: Page, fileName?: string, functionName?: string) {
	if (fileName) {
		await page.getByTestId("select-file").click();
		await page.getByRole("option", { name: fileName }).click();
	}

	if (functionName) {
		const functionNameInput = page.getByRole("textbox", { name: /Function name/i });
		await functionNameInput.click();
		await functionNameInput.fill(functionName);
	}
}

async function fillCronExpression(page: Page, cronExpression: string) {
	const cronInput = page.getByRole("textbox", { name: "Cron expression" });
	await cronInput.click();
	await cronInput.fill(cronExpression);
}

async function expectFunctionInputDisabled(page: Page, shouldBeDisabled: boolean = true) {
	const functionNameInput = page.getByRole("textbox", { name: /Function name/i });
	if (shouldBeDisabled) {
		await expect(functionNameInput).toBeDisabled();
	} else {
		await expect(functionNameInput).toBeEnabled();
	}
}

async function expectErrorMessage(page: Page, errorText: string, shouldBeVisible: boolean = true) {
	let errorMessage;
	if (errorText.includes("function") && errorText.includes("required")) {
		errorMessage = page.locator("text=/.*function.*required.*/i");
	} else {
		errorMessage = page.getByText(errorText);
	}

	if (shouldBeVisible) {
		await expect(errorMessage).toBeVisible();
	} else {
		await expect(errorMessage).not.toBeVisible();
	}
}

test.describe("Trigger Validation Suite", () => {
	test.beforeEach(async ({ dashboardPage }) => {
		await dashboardPage.createProjectFromMenu();
	});

	test("Webhook trigger without file/function - pass", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Webhook");

		await attemptSaveTrigger(page, true);

		const returnBackButton = page.locator('button[aria-label="Return back"]');
		await returnBackButton.click();

		await expect(page.getByText(triggerName)).toBeVisible();
	});

	test("Connection trigger without file/function - pass", async ({ page }) => {
		const connectionsHeader = page.getByText("Connections").first();
		await connectionsHeader.click();

		const modifyConnectionButton = page.locator('button[aria-label*="Modify"][aria-label*="connection"]');
		const connectionsExist = await modifyConnectionButton.isVisible().catch(() => false);

		if (!connectionsExist) {
			test.skip(true, "No connections available for testing connection triggers");
			return;
		}

		const triggersHeader = page.getByText("Triggers").first();
		await triggersHeader.click();

		await startTriggerCreation(page, triggerName, "Connection");

		await page.getByTestId("select-connection").click();
		await page.getByRole("option").first().click();

		await attemptSaveTrigger(page, true);

		const returnBackButton = page.locator('button[aria-label="Return back"]');
		await returnBackButton.click();

		await expect(page.getByText(triggerName)).toBeVisible();
	});

	test("Scheduler trigger missing file/function - error", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await fillCronExpression(page, "0 9 * * *");

		const saveButton = page.locator('button[aria-label="Save"]');
		await saveButton.click();

		await expectErrorMessage(page, "Entry function is required");

		const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
		await expect(nameInput).toBeVisible();
		await expect(nameInput).toHaveValue(triggerName);
	});

	test("Function name input without file selected - fail", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await fillCronExpression(page, "0 9 * * *");

		await expectFunctionInputDisabled(page, true);

		const saveButton = page.locator('button[aria-label="Save"]');
		await saveButton.click();

		await expectErrorMessage(page, "Entry function is required");
	});

	test("Function input becomes enabled when file is selected", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await expectFunctionInputDisabled(page, true);

		await page.getByTestId("select-file").click();
		await page.getByRole("option", { name: "program.py" }).click();

		await expectFunctionInputDisabled(page, false);

		const functionNameInput = page.getByRole("textbox", { name: /Function name/i });
		await functionNameInput.click();
		await functionNameInput.fill("test_function");
		await expect(functionNameInput).toHaveValue("test_function");
	});

	test("Scheduler trigger with file only - fail", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await fillCronExpression(page, "0 9 * * *");
		await fillFileAndFunction(page, "program.py");

		const saveButton = page.locator('button[aria-label="Save"]');
		await saveButton.click();

		await expectErrorMessage(page, "Entry function is required");

		const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
		await expect(nameInput).toBeVisible();
	});

	test("Scheduler trigger with file and function - pass", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await fillCronExpression(page, "0 9 * * *");
		await fillFileAndFunction(page, "program.py", "test_function");

		await attemptSaveTrigger(page, true);

		const returnBackButton = page.locator('button[aria-label="Return back"]');
		await returnBackButton.click();

		await expect(page.getByText(triggerName)).toBeVisible();

		const triggerInfoButton = page.locator(`button[aria-label="Trigger information for \\"${triggerName}\\""]`);
		await triggerInfoButton.hover();

		await expect(page.getByText("File:program.py")).toBeVisible();
		await expect(page.getByText("Entrypoint:test_function")).toBeVisible();
	});

	test("Function input toggles on trigger type switch", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await expectFunctionInputDisabled(page, true);

		await page.getByTestId("select-trigger-type").click();
		await page.getByRole("option", { name: "Webhook" }).click();

		await expectFunctionInputDisabled(page, true);

		await page.getByTestId("select-file").click();
		await page.getByRole("option", { name: "program.py" }).click();

		await expectFunctionInputDisabled(page, false);

		await page.getByTestId("select-trigger-type").click();
		await page.getByRole("option", { name: "Scheduler" }).click();

		await expectFunctionInputDisabled(page, false);
	});

	test("Error messages clear when form becomes valid", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		const saveButton = page.locator('button[aria-label="Save"]');
		await saveButton.click();

		await expectErrorMessage(page, "Entry function is required");

		await fillCronExpression(page, "0 9 * * *");
		await fillFileAndFunction(page, "program.py", "test_function");

		await expectErrorMessage(page, "Entry function is required", false);

		await attemptSaveTrigger(page, true);
	});
});
