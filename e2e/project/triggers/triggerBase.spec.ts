/* eslint-disable @typescript-eslint/naming-convention */
import type { Page } from "@playwright/test";

import { expect, test } from "e2e/fixtures";
import { waitForToast } from "e2e/utils";

const triggerName = "triggerName";
const testModifyCases = [
	{
		description: "without active deployment",
		modifyParams: {
			cron: "4 4 * * *",
			on_trigger: "newFunctionName",
			withActiveDeployment: false,
		},
		expectedEntryPoint: "newFunctionName",
		expectedFile: "program.py",
		expectedCron: "4 4 * * *",
	},
	{
		description: "with active deployment",
		modifyParams: {
			cron: "4 4 * * *",
			on_trigger: "newFunctionName",
			withActiveDeployment: true,
		},
		expectedEntryPoint: "newFunctionName",
		expectedFile: "program.py",
		expectedCron: "4 4 * * *",
	},
];

async function createTriggerScheduler(
	page: Page,
	name: string,
	cronExpression: string,
	fileName: string,
	on_trigger: string
) {
	const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
	await addTriggersButton.hover();
	await addTriggersButton.click();

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

	const saveButton = page.locator('button[aria-label="Save"]');
	await saveButton.click();

	await expect(nameInput).toBeDisabled();
	await expect(nameInput).toHaveValue(name);
}

async function modifyTrigger(
	page: Page,
	name: string,
	newCronExpression: string,
	newFunctionName: string,
	withActiveDeployment: boolean
) {
	if (withActiveDeployment) {
		const closeProjectSettingsButton = page.locator('button[aria-label="Close Project Settings"]');
		await closeProjectSettingsButton.click();

		const deployButton = page.locator('button[aria-label="Deploy project"]');
		await deployButton.click();

		const toast = await waitForToast(page, "Project deployment completed successfully");
		await expect(toast).toBeVisible();

		const configButton = page.locator('button[aria-label="Config"]');
		await configButton.click();

		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();
	}

	const editButton = page.locator(`button[aria-label="Edit ${name}"]`);
	await editButton.click();

	if (withActiveDeployment) {
		await page.locator('heading[aria-label="Warning Active Deployment"]').isVisible();

		const okButton = page.locator('button[aria-label="Ok"]');
		await okButton.click();

		await expect(page.getByText("Changes might affect the currently running deployments.")).toBeVisible();
	}

	const cronInput = page.getByRole("textbox", { name: "Cron expression" });
	await cronInput.click();
	await cronInput.fill(newCronExpression);

	const functionNameInput = page.getByRole("textbox", { name: "Function name" });
	await functionNameInput.click();
	await functionNameInput.fill(newFunctionName);

	const saveButton = page.locator('button[aria-label="Save"]');
	await saveButton.click();
}

test.describe("Project Triggers Suite", () => {
	test.beforeEach(async ({ dashboardPage }) => {
		await dashboardPage.createProjectFromMenu();
	});

	test("Create trigger with cron expression", async ({ page }) => {
		await createTriggerScheduler(page, triggerName, "5 4 * * *", "program.py", "on_trigger");

		const returnBackButton = page.locator('button[aria-label="Return back"]');
		await returnBackButton.click();

		await expect(page.getByText(triggerName)).toBeVisible();

		const triggerInfoButton = page.locator(`button[aria-label="Trigger information for \\"${triggerName}\\""]`);
		await expect(triggerInfoButton).toBeVisible();
	});

	test.describe("Modify trigger with cron expression", () => {
		testModifyCases.forEach(({ description, modifyParams, expectedEntryPoint, expectedFile, expectedCron }) => {
			test(`Modify trigger ${description}`, async ({ page }) => {
				await createTriggerScheduler(page, triggerName, "5 4 * * *", "program.py", "on_trigger");

				const returnBackButton = page.locator('button[aria-label="Return back"]');
				await returnBackButton.click();

				await modifyTrigger(
					page,
					triggerName,
					modifyParams.cron,
					modifyParams.on_trigger,
					modifyParams.withActiveDeployment
				);

				const triggerInfoButton = page.locator(
					`button[aria-label="Trigger information for \\"${triggerName}\\""]`
				);
				await triggerInfoButton.hover();

				await expect(page.getByTestId("trigger-detail-cron-expression")).toHaveText(expectedCron);
				await expect(page.getByTestId("trigger-detail-entrypoint")).toHaveText(expectedEntryPoint);
				await expect(page.getByTestId("trigger-detail-file")).toHaveText(expectedFile);
				await expect(page.getByText(triggerName)).toBeVisible();
			});
		});
	});

	test("Delete trigger", async ({ page }) => {
		await createTriggerScheduler(page, "triggerName", "5 4 * * *", "program.py", "on_trigger");

		const returnBackButton = page.locator('button[aria-label="Return back"]');
		await returnBackButton.click();

		await expect(page.getByText("triggerName")).toBeVisible();

		const deleteButton = page.locator(`button[aria-label="Delete ${triggerName}"]`);
		await deleteButton.click();

		const okButton = page.locator('button[aria-label="Ok"]');
		await okButton.click();

		const noTriggersMessage = page.getByText("No triggers found");
		await expect(noTriggersMessage).toBeVisible();
	});

	test("Create trigger without a values", async ({ page }) => {
		const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
		await addTriggersButton.hover();
		await addTriggersButton.click();

		await page.getByTestId("select-trigger-type").click();
		await page.getByRole("option", { name: "Scheduler" }).click();
		await page.getByTestId("select-file").click();
		await page.getByRole("option", { name: "program.py" }).click();

		const saveButton = page.locator('button[aria-label="Save"]');
		await saveButton.click();

		const nameErrorMessage = page.getByText("Name is required");
		await expect(nameErrorMessage).toBeVisible();

		const nameInput = page.getByRole("textbox", { exact: true, name: "Name" });
		await nameInput.click();
		await nameInput.fill("triggerTest");

		await saveButton.click();

		const functionNameErrorMessage = page.locator("text=/.*function.*required.*/i");
		await expect(functionNameErrorMessage).toBeVisible();
	});

	test("Modify trigger without a values", async ({ page }) => {
		await createTriggerScheduler(page, "triggerName", "5 4 * * *", "program.py", "on_trigger");

		const returnBackButton = page.locator('button[aria-label="Return back"]');
		await returnBackButton.click();

		const editButton = page.locator(`button[aria-label="Edit ${triggerName}"]`);
		await editButton.first().click();

		await page.getByRole("textbox", { name: "Cron expression" }).click();
		await page.getByRole("textbox", { name: "Cron expression" }).fill("");

		await page.getByRole("textbox", { name: "Function name" }).click();
		await page.getByRole("textbox", { name: "Function name" }).fill("");

		const saveButton = page.locator('button[aria-label="Save"]');
		await saveButton.click();

		const functionNameErrorMessage = page.locator("text=/.*function.*required.*/i");
		await expect(functionNameErrorMessage).toBeVisible();
	});
});
