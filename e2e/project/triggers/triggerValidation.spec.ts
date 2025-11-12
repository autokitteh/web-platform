import type { Page } from "@playwright/test";

import { expect, test } from "e2e/fixtures";
import { waitForToast } from "e2e/utils";

const triggerName = "testTrigger";

async function startTriggerCreation(page: Page, name: string, triggerType: string) {
	await page.getByRole("button", { name: "Add Triggers" }).hover();

	await page.getByRole("button", { name: "Add Triggers" }).click();

	const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
	await nameInput.click();
	await nameInput.fill(name);

	await page.getByTestId("select-trigger-type").click();
	await page.getByRole("option", { name: triggerType }).click();
}

async function attemptSaveTrigger(page: Page, shouldSucceed: boolean = true) {
	await page.getByRole("button", { name: "Save", exact: true }).click();

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

	test("Create webhook trigger without file and function - should pass", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Webhook");

		await attemptSaveTrigger(page, true);

		await page.getByRole("button", { name: "Return back" }).click();

		await expect(page.getByText(triggerName)).toBeVisible();
	});

	test("Create connection trigger without file and function - should pass", async ({ page }) => {
		const connectionsHeader = page.getByText("Connections").first();
		await connectionsHeader.click();

		const connectionsExist = await page
			.getByRole("button", { name: /Modify .* connection/i })
			.isVisible()
			.catch(() => false);

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

		await page.getByRole("button", { name: "Return back" }).click();

		await expect(page.getByText(triggerName)).toBeVisible();
	});

	test("Create scheduler trigger without file and function - should display an error", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await fillCronExpression(page, "0 9 * * *");

		await page.getByRole("button", { name: "Save", exact: true }).click();

		await expectErrorMessage(page, "Entry function is required");

		const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
		await expect(nameInput).toBeVisible();
		await expect(nameInput).toHaveValue(triggerName);
	});

	test("Try to enter function name without file selected - should fail", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await fillCronExpression(page, "0 9 * * *");

		await expectFunctionInputDisabled(page, true);

		await page.getByRole("button", { name: "Save", exact: true }).click();

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

	test("Create scheduler trigger with file but no function - should fail", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await fillCronExpression(page, "0 9 * * *");
		await fillFileAndFunction(page, "program.py");

		await page.getByRole("button", { name: "Save", exact: true }).click();

		await expectErrorMessage(page, "Entry function is required");

		const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
		await expect(nameInput).toBeVisible();
	});

	test("Create scheduler trigger with both file and function - should pass", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		await fillCronExpression(page, "0 9 * * *");
		await fillFileAndFunction(page, "program.py", "test_function");

		await attemptSaveTrigger(page, true);

		await page.getByRole("button", { name: "Return back" }).click();

		await expect(page.getByText(triggerName)).toBeVisible();
		await expect(page.getByText("program.py:test_function")).toBeVisible();
	});

	test("Function input disabled state toggles correctly when switching trigger types", async ({ page }) => {
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

		await page.getByRole("button", { name: "Save", exact: true }).click();

		await expectErrorMessage(page, "Entry function is required");

		await fillCronExpression(page, "0 9 * * *");
		await fillFileAndFunction(page, "program.py", "test_function");

		await expectErrorMessage(page, "Entry function is required", false);

		await attemptSaveTrigger(page, true);
	});
});
