import { expect, test } from "../../fixtures";

test.describe("Trigger Grouped Select Suite", () => {
	test.beforeEach(async ({ dashboardPage }) => {
		await dashboardPage.createProjectFromMenu();
	});

	test("Grouped select displays Base Trigger Types group", async ({ page }) => {
		const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
		await addTriggersButton.waitFor({ state: "visible", timeout: 10000 });
		await addTriggersButton.hover();
		await addTriggersButton.click();

		const selectTriggerType = page.getByTestId("select-trigger-type-empty");
		await selectTriggerType.waitFor({ state: "visible", timeout: 10000 });
		await selectTriggerType.click();

		const baseTriggerTypesGroup = page.getByText("Base Trigger Types", { exact: true });
		await expect(baseTriggerTypesGroup).toBeVisible({ timeout: 5000 });
	});

	test("Can select Scheduler from Base Trigger Types group", async ({ page }) => {
		const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
		await addTriggersButton.waitFor({ state: "visible", timeout: 10000 });
		await addTriggersButton.hover();
		await addTriggersButton.click();

		const selectTriggerType = page.getByTestId("select-trigger-type-empty");
		await selectTriggerType.waitFor({ state: "visible", timeout: 10000 });
		await selectTriggerType.click();

		const schedulerOption = page.getByRole("option", { name: "Scheduler" });
		await expect(schedulerOption).toBeVisible({ timeout: 5000 });
		await schedulerOption.click();

		await expect(page.getByRole("textbox", { name: "Cron expression" })).toBeVisible({ timeout: 5000 });
	});

	test("Can select Webhook from Base Trigger Types group", async ({ page }) => {
		const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
		await addTriggersButton.waitFor({ state: "visible", timeout: 10000 });
		await addTriggersButton.hover();
		await addTriggersButton.click();

		const selectTriggerType = page.getByTestId("select-trigger-type-empty");
		await selectTriggerType.waitFor({ state: "visible", timeout: 10000 });
		await selectTriggerType.click();

		const webhookOption = page.getByRole("option", { name: "Webhook" });
		await expect(webhookOption).toBeVisible({ timeout: 5000 });
		await webhookOption.click();

		const webhookUrlInput = page.getByTestId("webhook-url");
		await expect(webhookUrlInput).toBeVisible({ timeout: 5000 });
		await expect(webhookUrlInput).toHaveValue("The webhook URL will be generated after saving the trigger");
	});

	test("Group headings are styled correctly", async ({ page }) => {
		const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
		await addTriggersButton.waitFor({ state: "visible", timeout: 10000 });
		await addTriggersButton.hover();
		await addTriggersButton.click();

		const selectTriggerType = page.getByTestId("select-trigger-type-empty");
		await selectTriggerType.waitFor({ state: "visible", timeout: 10000 });
		await selectTriggerType.click();

		const baseTriggerTypesGroup = page.getByText("Base Trigger Types", { exact: true });
		await expect(baseTriggerTypesGroup).toBeVisible({ timeout: 5000 });

		const groupHeadingStyles = await baseTriggerTypesGroup.evaluate((el) => {
			const styles = window.getComputedStyle(el);
			return {
				fontSize: styles.fontSize,
				textTransform: styles.textTransform,
			};
		});

		expect(groupHeadingStyles.fontSize).toBe("11px");
		expect(groupHeadingStyles.textTransform).toBe("uppercase");
	});
});
