import type { Page } from "@playwright/test";

import { expect, test } from "e2e/fixtures";
import { waitForToast } from "e2e/utils";

async function startTriggerCreation(page: Page, triggerType: string, name: string = "testTrigger") {
	await page.getByRole("button", { name: "Add new" }).click();

	const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
	await nameInput.click();
	await nameInput.fill(name);

	await page.getByTestId("select-trigger-type").click();
	await page.getByRole("option", { name: triggerType }).click();
}

async function expectValidationError(page: Page, errorText: string, shouldBeVisible: boolean = true) {
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

async function saveAndExpectSuccess(page: Page) {
	await page.getByRole("button", { name: "Save", exact: true }).click();
	const toast = await waitForToast(page, "Trigger created successfully");
	await expect(toast).toBeVisible();
}

async function saveAndExpectFailure(page: Page, expectedError: string) {
	await page.getByRole("button", { name: "Save", exact: true }).click();
	await expectValidationError(page, expectedError);

	const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
	await expect(nameInput).toBeVisible();
}

test.describe("Trigger Validation Core Requirements", () => {
	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		await page.getByRole("tab", { name: "Triggers" }).click();
	});

	test("1. Create webhook trigger without file and function - should pass", async ({ page }) => {
		await startTriggerCreation(page, "Webhook");
		await saveAndExpectSuccess(page);
	});

	test("2. Create connection trigger without file and function - should pass", async ({ page }) => {
		await page.getByRole("tab", { name: "Connections" }).click();
		const connectionsExist = await page
			.getByRole("button", { name: /Modify .* connection/i })
			.isVisible()
			.catch(() => false);

		if (!connectionsExist) {
			test.skip(true, "No connections available for testing");
			return;
		}

		await page.getByRole("tab", { name: "Triggers" }).click();
		await startTriggerCreation(page, "Connection");

		await page.getByTestId("select-connection").click();
		await page.getByRole("option").first().click();

		await saveAndExpectSuccess(page);
	});

	test("3. Create scheduler trigger without file and function - should display error", async ({ page }) => {
		await startTriggerCreation(page, "Scheduler");

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("0 9 * * *");

		await saveAndExpectFailure(page, "Entry function is required");
	});

	test("4. Try to enter function name without file selected - should fail", async ({ page }) => {
		await startTriggerCreation(page, "Scheduler");

		const functionInput = page.getByRole("textbox", { name: /Function name/i });
		await expect(functionInput).toBeDisabled();

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("0 9 * * *");

		await saveAndExpectFailure(page, "Entry function is required");
	});

	test("5. Create scheduler trigger with file and function - should pass", async ({ page }) => {
		await startTriggerCreation(page, "Scheduler");

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("0 9 * * *");

		await page.getByTestId("select-file").click();
		await page.getByRole("option", { name: "program.py" }).click();

		const functionInput = page.getByRole("textbox", { name: /Function name/i });
		await expect(functionInput).toBeEnabled();

		await functionInput.click();
		await functionInput.fill("test_function");

		await saveAndExpectSuccess(page);
	});

	test("Function input becomes enabled when file is selected", async ({ page }) => {
		await startTriggerCreation(page, "Scheduler");

		const functionInput = page.getByRole("textbox", { name: /Function name/i });
		await expect(functionInput).toBeDisabled();

		await page.getByTestId("select-file").click();
		await page.getByRole("option", { name: "program.py" }).click();

		await expect(functionInput).toBeEnabled();
	});
});
