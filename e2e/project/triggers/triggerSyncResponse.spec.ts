/* eslint-disable @typescript-eslint/naming-convention */
import type { Page } from "@playwright/test";

import { expect, test } from "e2e/fixtures";
import { waitForToast } from "e2e/utils";

const triggerName = "syncTriggerTest";

async function createTriggerWithSync(
	page: Page,
	name: string,
	cronExpression: string,
	fileName: string,
	on_trigger: string,
	isSync: boolean
) {
	await page.getByRole("button", { name: "Add new" }).click();

	const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
	await nameInput.click();
	await nameInput.fill(name);

	await page.getByTestId("select-trigger-type").click();
	await page.getByRole("option", { name: "Scheduler" }).click();

	const cronInput = page.getByRole("textbox", { name: "Cron expression" });
	await cronInput.click();
	await cronInput.fill(cronExpression);

	await page.getByTestId("select-file").click();
	await page.getByRole("option", { name: fileName }).click();

	const functionNameInput = page.getByRole("textbox", { name: "Function name" });
	await functionNameInput.click();
	await functionNameInput.fill(on_trigger);

	if (isSync) {
		const syncToggle = page.locator('label:has-text("Synchronous Response")');
		await syncToggle.click();
	}

	await page.getByRole("button", { name: "Save", exact: true }).click();

	await expect(nameInput).toBeDisabled();
	await expect(nameInput).toHaveValue(name);
}

async function verifySyncToggleState(page: Page, expectedState: boolean) {
	const syncCheckbox = page.locator('label:has-text("Synchronous Response") input[type="checkbox"]');
	if (expectedState) {
		await expect(syncCheckbox).toBeChecked();
	} else {
		await expect(syncCheckbox).not.toBeChecked();
	}
}

async function toggleSyncResponse(page: Page, enable: boolean) {
	const syncCheckbox = page.locator('label:has-text("Synchronous Response") input[type="checkbox"]');
	const currentState = await syncCheckbox.isChecked();

	if (currentState !== enable) {
		const syncLabel = page.locator('label:has-text("Synchronous Response")');
		await syncLabel.click();
	}
}

test.describe("Trigger Synchronous Response Suite", () => {
	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		await page.getByRole("tab", { name: "Triggers" }).click();
	});

	test("Create trigger with Synchronous Response enabled", async ({ page }) => {
		await createTriggerWithSync(page, triggerName, "5 4 * * *", "program.py", "on_trigger", true);

		await verifySyncToggleState(page, true);

		await page.getByRole("button", { name: "Return back" }).click();

		const newRowInTable = page.getByRole("row", { name: triggerName });
		await expect(newRowInTable).toHaveCount(1);
	});

	test("Create trigger with Synchronous Response disabled", async ({ page }) => {
		await createTriggerWithSync(page, triggerName, "5 4 * * *", "program.py", "on_trigger", false);

		await verifySyncToggleState(page, false);

		await page.getByRole("button", { name: "Return back" }).click();

		const newRowInTable = page.getByRole("row", { name: triggerName });
		await expect(newRowInTable).toHaveCount(1);
	});

	test("Modify trigger to enable Synchronous Response", async ({ page, projectPage }) => {
		await createTriggerWithSync(page, triggerName, "5 4 * * *", "program.py", "on_trigger", false);

		await verifySyncToggleState(page, false);

		await page.getByRole("button", { name: "Return back" }).click();

		await page.getByRole("button", { name: `Modify ${triggerName} trigger` }).click();

		await projectPage.acknowledgeDeploymentWarning();

		await toggleSyncResponse(page, true);

		await page.getByRole("button", { name: "Save", exact: true }).click();

		await page.getByRole("button", { name: "Return back" }).click();

		await page.getByRole("button", { name: `Modify ${triggerName} trigger` }).click();

		await verifySyncToggleState(page, true);
	});

	test("Modify trigger to disable Synchronous Response", async ({ page }) => {
		await createTriggerWithSync(page, triggerName, "5 4 * * *", "program.py", "on_trigger", true);

		await verifySyncToggleState(page, true);

		await toggleSyncResponse(page, false);

		await page.getByRole("button", { name: "Save", exact: true }).click();

		await page.getByRole("button", { name: "Return back" }).click();

		await page.getByRole("button", { name: `Modify ${triggerName} trigger` }).click();

		await verifySyncToggleState(page, false);
	});

	test("Synchronous Response state persists after navigation", async ({ page }) => {
		await createTriggerWithSync(page, triggerName, "5 4 * * *", "program.py", "on_trigger", true);

		await verifySyncToggleState(page, true);

		await page.getByRole("button", { name: "Return back" }).click();

		await page.getByRole("tab", { name: "Connections" }).click();

		await page.getByRole("tab", { name: "Triggers" }).click();

		await page.getByRole("button", { name: `Modify ${triggerName} trigger` }).click();

		await verifySyncToggleState(page, true);
	});

	test("Synchronous Response works with Durability toggle", async ({ page }) => {
		await page.getByRole("button", { name: "Add new" }).click();

		const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
		await nameInput.click();
		await nameInput.fill(triggerName);

		await page.getByTestId("select-trigger-type").click();
		await page.getByRole("option", { name: "Scheduler" }).click();

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("5 4 * * *");

		await page.getByTestId("select-file").click();
		await page.getByRole("option", { name: "program.py" }).click();

		const functionNameInput = page.getByRole("textbox", { name: "Function name" });
		await functionNameInput.click();
		await functionNameInput.fill("on_trigger");

		const durabilityLabel = page.locator('label:has-text("Durability - for long-running reliable workflows")');
		await durabilityLabel.click();

		const syncLabel = page.locator('label:has-text("Synchronous Response")');
		await syncLabel.click();

		const durabilityCheckbox = page.locator(
			'label:has-text("Durability - for long-running reliable workflows") input[type="checkbox"]'
		);
		const syncCheckbox = page.locator('label:has-text("Synchronous Response") input[type="checkbox"]');

		await expect(durabilityCheckbox).toBeChecked();
		await expect(syncCheckbox).toBeChecked();

		await page.getByRole("button", { name: "Save", exact: true }).click();

		await expect(nameInput).toBeDisabled();
		await expect(durabilityCheckbox).toBeChecked();
		await expect(syncCheckbox).toBeChecked();
	});

	test("Synchronous Response toggle visible in edit mode", async ({ page }) => {
		await createTriggerWithSync(page, triggerName, "5 4 * * *", "program.py", "on_trigger", false);

		await page.getByRole("button", { name: "Return back" }).click();

		await page.getByRole("button", { name: `Modify ${triggerName} trigger` }).click();

		const syncLabel = page.locator('label:has-text("Synchronous Response")');
		await expect(syncLabel).toBeVisible();
	});

	test("Modify trigger with active deployment preserves Synchronous Response state", async ({
		page,
		projectPage,
	}) => {
		await createTriggerWithSync(page, triggerName, "5 4 * * *", "program.py", "on_trigger", true);

		await verifySyncToggleState(page, true);

		await page.getByRole("button", { name: "Return back" }).click();

		const deployButton = page.getByRole("button", { name: "Deploy project" });
		await deployButton.click();
		const toast = await waitForToast(page, "Project deployment completed successfully");
		await expect(toast).toBeVisible();

		await page.getByRole("button", { name: `Modify ${triggerName} trigger` }).click();

		await projectPage.acknowledgeDeploymentWarning();

		await verifySyncToggleState(page, true);

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await cronInput.click();
		await cronInput.fill("6 5 * * *");

		await page.getByRole("button", { name: "Save", exact: true }).click();

		await page.getByRole("button", { name: "Return back" }).click();

		await page.getByRole("button", { name: `Modify ${triggerName} trigger` }).click();

		await verifySyncToggleState(page, true);
	});

	test("Synchronous Response description is visible", async ({ page, projectPage }) => {
		await page.getByRole("button", { name: "Add new" }).click();

		await projectPage.acknowledgeDeploymentWarning();

		const syncDescription = page.getByText("Allow scripts to send custom HTTP responses back to webhook callers");
		await expect(syncDescription).toBeVisible();
	});
});
