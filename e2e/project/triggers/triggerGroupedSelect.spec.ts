import { baseTriggerTypes } from "../../../src/constants/triggersBase.constants";
import { expect, test } from "../../fixtures";
import { cleanupCurrentProject } from "../../utils";

test.describe("Trigger Grouped Select Suite", () => {
	test.beforeEach(async ({ dashboardPage }) => {
		await dashboardPage.createProjectFromMenu();
	});

	test.afterEach(async ({ page }) => {
		await cleanupCurrentProject(page);
	});

	test("Grouped select displays Base Trigger Types", async ({ page }) => {
		const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
		await expect(addTriggersButton).toBeVisible();
		await addTriggersButton.hover();
		await addTriggersButton.click();

		const selectWrapper = page.getByTestId("select-trigger-type-empty");
		await expect(selectWrapper).toBeVisible();
		const selectInput = selectWrapper.getByRole("combobox");
		await selectInput.click();

		for (const triggerType of baseTriggerTypes) {
			const option = page.getByRole("option", { name: triggerType.ariaLabel });
			await expect(option).toBeVisible();
		}
	});

	test("Can select Scheduler from Base Trigger Types group", async ({ page }) => {
		const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
		await expect(addTriggersButton).toBeVisible();
		await addTriggersButton.hover();
		await addTriggersButton.click();

		const selectWrapper = page.getByTestId("select-trigger-type-empty");
		await expect(selectWrapper).toBeVisible();
		const selectInput = selectWrapper.getByRole("combobox");
		await selectInput.click();

		const schedulerOption = page.getByRole("option", { name: "Scheduler Trigger" });
		await expect(schedulerOption).toBeVisible();
		await schedulerOption.click();

		await expect(page.getByRole("textbox", { name: "Cron expression" })).toBeVisible();
	});

	test("Can select Webhook from Base Trigger Types group", async ({ page }) => {
		const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
		await expect(addTriggersButton).toBeVisible();
		await addTriggersButton.hover();
		await addTriggersButton.click();

		const selectWrapper = page.getByTestId("select-trigger-type-empty");
		await expect(selectWrapper).toBeVisible();
		const selectInput = selectWrapper.getByRole("combobox");
		await selectInput.click();

		const webhookOption = page.getByRole("option", { name: "Webhook Trigger" });
		await expect(webhookOption).toBeVisible();
		await webhookOption.click();

		const webhookUrlInput = page.getByTestId("webhook-url");
		await expect(webhookUrlInput).toBeVisible();
		await expect(webhookUrlInput).toHaveValue("The webhook URL will be generated after saving the trigger");
	});
});
