import type { Page } from "@playwright/test";

import { expect, test } from "e2e/fixtures";
import { waitForToast } from "e2e/utils";

async function startTriggerCreation(page: Page, triggerType: string, name: string = "testTrigger") {
	await page.locator('button[aria-label="Add Triggers"]').hover();
	await page.locator('button[aria-label="Add Triggers"]').click();

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
	await page.locator('button[aria-label="Save"]').click();
	const toast = await waitForToast(page, "Trigger created successfully");
	await expect(toast).toBeVisible();
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

	test("1. Webhook trigger without file/function - pass", async ({ page }) => {
		await startTriggerCreation(page, "Webhook");
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

		await startTriggerCreation(page, "Connection");

		await page.getByTestId("select-connection").click();
		await page.getByRole("option").first().click();

		await saveAndExpectSuccess(page);
	});

	test("3. Scheduler trigger missing file/function - error", async ({ page }) => {
		await startTriggerCreation(page, "Scheduler");

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("0 9 * * *");

		await saveAndExpectFailure(page, "Entry function is required");
	});

	test("4. Function name without file selected - fail", async ({ page }) => {
		await startTriggerCreation(page, "Scheduler");

		const functionInput = page.getByRole("textbox", { name: /Function name/i });
		await expect(functionInput).toBeDisabled();

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("0 9 * * *");

		await saveAndExpectFailure(page, "Entry function is required");
	});

	test("5. Scheduler trigger with file/function - pass", async ({ page }) => {
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
