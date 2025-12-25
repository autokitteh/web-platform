import type { Page } from "@playwright/test";

import { expect, test } from "../../fixtures";
import { cleanupCurrentProject } from "../../utils";

const triggerName = "timezone_trigger";
const defaultTimezoneValue = "Etc/GMT";

async function createTrigger(page: Page, name: string, cronExpression: string, fileName: string, functionName: string) {
	await page.getByRole("button", { name: "Add Triggers" }).click();
	await page.getByRole("textbox", { name: "Name", exact: true }).fill(name);
	await page.getByTestId("select-trigger-type-empty").click();
	await page.getByRole("option", { name: "Scheduler" }).click();
	await page.getByRole("textbox", { name: "Cron expression" }).fill(cronExpression);
	await page.getByTestId("select-file-empty").click();
	await page.getByRole("option", { name: fileName }).click();
	await page.getByRole("combobox", { name: "Function name" }).fill(functionName);
	await page.getByRole("button", { name: "Save", exact: true }).click();
}

async function returnToTriggersList(page: Page) {
	await page.getByRole("button", { name: "Return back" }).click();
}

async function hoverTriggerInfo(page: Page, triggerName: string) {
	await page.locator(`button[aria-label='Trigger information for "${triggerName}"']`).hover();
}

async function selectTimezone(page: Page, searchTerm: string, optionName: RegExp) {
	await page.getByRole("combobox", { name: defaultTimezoneValue }).click();
	await page.keyboard.type(searchTerm);
	await page.getByRole("option", { name: optionName }).click();
}

test.describe("Trigger Timezone Features", () => {
	test.beforeEach(async ({ dashboardPage }) => {
		await dashboardPage.createProjectFromMenu();
	});

	test.afterEach(async ({ page }) => {
		await cleanupCurrentProject(page);
	});

	test("Trigger shows default UTC timezone in info popover", async ({ page }) => {
		await createTrigger(page, triggerName, "5 4 * * *", "program.py", "on_trigger");
		await returnToTriggersList(page);

		await hoverTriggerInfo(page, triggerName);

		await expect(page.getByTestId("trigger-detail-timezone")).toHaveText("UTC");
	});

	test("Edit trigger timezone and verify change in info popover", async ({ page }) => {
		await createTrigger(page, triggerName, "5 4 * * *", "program.py", "on_trigger");
		await returnToTriggersList(page);

		await page.getByText(triggerName).click();
		await selectTimezone(page, "jeru", /Jerusalem/);
		await page.getByRole("button", { name: "Save", exact: true }).click();

		await hoverTriggerInfo(page, triggerName);

		await expect(page.getByTestId("trigger-detail-timezone")).toHaveText("Asia/Jerusalem");
	});

	test("Invalid timezone input retains original value", async ({ page }) => {
		await createTrigger(page, triggerName, "5 4 * * *", "program.py", "on_trigger");

		await page.getByRole("combobox", { name: defaultTimezoneValue }).fill("invalid_timezone");
		await page.getByRole("textbox", { name: "Cron expression" }).click();

		await expect(page.getByRole("combobox", { name: defaultTimezoneValue })).toBeVisible();
	});
});
