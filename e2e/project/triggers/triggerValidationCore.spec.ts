import type { Page } from "@playwright/test";

import { expect, test } from "../../fixtures";
import { cleanupCurrentProject, createCustomEntryFunction, startTriggerCreation } from "../../utils";
import { waitForToastToBeRemoved } from "../../utils/waitForToast";

const triggerName = "testTrigger";

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
	await page.locator('button[aria-label="Save"]').click();
	await waitForToastToBeRemoved(page, "Trigger created successfully");
}

async function saveAndExpectFailure(page: Page, expectedError: string) {
	await page.locator('button[aria-label="Save"]').click();
	await expectValidationError(page, expectedError);

	const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
	await expect(nameInput).toBeVisible();
}

test.describe("Trigger Validation Core Requirements", () => {
	test.beforeEach(async ({ dashboardPage }) => {
		await dashboardPage.createProjectFromMenu();
	});

	test.afterEach(async ({ page }) => {
		await cleanupCurrentProject(page);
	});

	test("1. Webhook trigger without file/function - pass", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Webhook");
		await saveAndExpectSuccess(page);
	});

	test("2. Connection trigger without file/function - pass", async ({ page }) => {
		const connectionsHeader = page.getByText("Connections").first();
		await connectionsHeader.click();

		const connectionsExist = await page
			.locator('button[aria-label*="Modify"][aria-label*="connection"]')
			.isVisible()
			.catch(() => false);

		if (!connectionsExist) {
			test.skip(true, "No connections available for testing");
			return;
		}

		const triggersHeader = page.getByText("Triggers").first();
		await triggersHeader.click();

		await startTriggerCreation(page, triggerName, "Connection");

		await page.getByTestId("select-connection-empty").click();
		await page.getByRole("option").first().click();

		await saveAndExpectSuccess(page);
	});

	test("3. Scheduler trigger missing file/function - error", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("0 9 * * *");

		await saveAndExpectFailure(page, "Entry function is required");
	});

	test("4. Function name is editable without file selected", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		const entryFunctionSelect = page.getByTestId("select-entry-function-empty");
		await expect(entryFunctionSelect).toBeVisible();

		await createCustomEntryFunction(page, "my_test_function");

		const selectedValue = page.locator('[data-testid^="select-entry-function-"][data-testid$="-selected"]');
		await expect(selectedValue).toBeVisible();

		const valueText = selectedValue.locator(".react-select__single-value");
		await expect(valueText).toContainText("my_test_function");
	});

	test("5. Function name without file - cannot save", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("0 9 * * *");

		await createCustomEntryFunction(page, "my_test_function");

		await saveAndExpectFailure(page, "File is required");
	});

	test("6. Scheduler trigger with file/function - pass", async ({ page }) => {
		await startTriggerCreation(page, triggerName, "Scheduler");

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("0 9 * * *");

		await page.getByTestId("select-file-empty").click();
		await page.getByRole("option", { name: "program.py" }).click();

		await createCustomEntryFunction(page, "test_function");

		await saveAndExpectSuccess(page);
	});
});
