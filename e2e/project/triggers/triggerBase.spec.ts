/* eslint-disable @typescript-eslint/naming-convention */
import type { Page } from "@playwright/test";

import { expect, test } from "../../fixtures";
import { waitForToast } from "../../utils";

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
	await page.locator('button[aria-label="Add Triggers"]').hover();
	await page.locator('button[aria-label="Add Triggers"]').click();

	const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
	await nameInput.click();
	await nameInput.fill(name);

	await page.getByTestId("select-trigger-type-empty").click();
	await page.getByRole("option", { name: "Scheduler" }).click();

	const cronInput = page.getByRole("textbox", { name: "Cron expression" });
	await cronInput.click();
	await cronInput.fill(cronExpression);

	await page.getByTestId("select-file").click();
	await page.getByRole("option", { name: fileName }).click();

	const functionNameInput = page.getByRole("textbox", { name: "Function name" });
	await functionNameInput.click();
	await functionNameInput.fill(on_trigger);

	await page.locator('button[aria-label="Save"]').click();
	await expect(nameInput).toBeDisabled({ timeout: 1500 });
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
		await page.locator('button[aria-label="Close Project Settings"]').click();
		const deployButton = page.locator('button[aria-label="Deploy project"]');
		await deployButton.click();

		const toast = await waitForToast(page, "Project deployment completed successfully");
		await expect(toast).toBeVisible();

		await page.locator('button[aria-label="Config"]').click();

		await page.waitForSelector("#project-sidebar-config", {
			state: "visible",
			timeout: 10000,
		});

		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();
	}

	const configureButtons = page.locator(`button[aria-label="Edit ${name}"]`);
	await configureButtons.click();

	if (withActiveDeployment) {
		await page.locator('heading[aria-label="Warning Active Deployment"]').isVisible();
		await page.locator('button[aria-label="Ok"]').click();

		await expect(page.getByText("Changes might affect the currently running deployments.")).toBeVisible();
	}

	const cronInput = page.getByRole("textbox", { name: "Cron expression" });
	await cronInput.click();
	await cronInput.fill(newCronExpression);

	const functionNameInput = page.getByRole("textbox", { name: "Function name" });
	await functionNameInput.click();
	await functionNameInput.fill(newFunctionName);

	await page.locator('button[aria-label="Save"]').click();
}

test.describe("Project Triggers Suite", () => {
	test.beforeEach(async ({ dashboardPage }) => {
		await dashboardPage.createProjectFromMenu();
	});

	test("Create trigger with cron expression", async ({ page }) => {
		await createTriggerScheduler(page, triggerName, "5 4 * * *", "program.py", "on_trigger");

		await page.locator('button[aria-label="Return back"]').click();

		await expect(page.getByText(triggerName)).toBeVisible();
		await expect(page.locator(`button[aria-label='Trigger information for "${triggerName}"']`)).toBeVisible();
	});

	test.describe("Modify trigger with cron expression", () => {
		testModifyCases.forEach(({ description, modifyParams, expectedEntryPoint, expectedFile, expectedCron }) => {
			test(`Modify trigger ${description}`, async ({ page }) => {
				await createTriggerScheduler(page, triggerName, "5 4 * * *", "program.py", "on_trigger");
				await page.locator('button[aria-label="Return back"]').click();

				await modifyTrigger(
					page,
					triggerName,
					modifyParams.cron,
					modifyParams.on_trigger,
					modifyParams.withActiveDeployment
				);

				await page.locator(`button[aria-label='Trigger information for "${triggerName}"']`).hover();

				await expect(page.getByTestId("trigger-detail-cron-expression")).toHaveText(expectedCron);
				await expect(page.getByTestId("trigger-detail-entrypoint")).toHaveText(expectedEntryPoint);
				await expect(page.getByTestId("trigger-detail-file")).toHaveText(expectedFile);
				await expect(page.getByText(triggerName)).toBeVisible();
			});
		});
	});

	test("Delete trigger", async ({ page }) => {
		await createTriggerScheduler(page, "triggerName", "5 4 * * *", "program.py", "on_trigger");
		await page.locator('button[aria-label="Return back"]').click();
		await expect(page.getByText("triggerName")).toBeVisible();

		const deleteButton = page.locator(`button[aria-label="Delete ${triggerName}"]`);
		await deleteButton.click();
		await page.locator('button[aria-label="Ok"]').click();

		const noTriggersMessage = page.getByText("No triggers found");
		await expect(noTriggersMessage).toBeVisible();
	});

	test("Create trigger without a values", async ({ page }) => {
		await page.locator('button[aria-label="Add Triggers"]').hover();

		await page.locator('button[aria-label="Add Triggers"]').click();
		await page.getByTestId("select-trigger-type-empty").click();
		await page.getByRole("option", { name: "Scheduler" }).click();
		await page.getByTestId("select-file-empty").click();
		await page.getByRole("option", { name: "program.py" }).click();
		await page.locator('button[aria-label="Save"]').click();
		const nameErrorMessage = page.getByText("Name is required");

		await expect(nameErrorMessage).toBeVisible();
		const nameInput = page.getByRole("textbox", { exact: true, name: "Name" });
		await nameInput.click();
		await nameInput.fill("triggerTest");
		await page.locator('button[aria-label="Save"]').click();

		const functionNameErrorMessage = page.locator("text=/.*function.*required.*/i");
		await expect(functionNameErrorMessage).toBeVisible();
	});

	test("Modify trigger without a values", async ({ page }) => {
		await createTriggerScheduler(page, "triggerName", "5 4 * * *", "program.py", "on_trigger");
		await page.locator('button[aria-label="Return back"]').click();

		const configureButtons = page.locator(`button[aria-label="Edit ${triggerName}"]`);
		await configureButtons.first().click();
		await page.getByRole("textbox", { name: "Cron expression" }).click();
		await page.getByRole("textbox", { name: "Cron expression" }).fill("");

		await page.getByRole("textbox", { name: "Function name" }).click();
		await page.getByRole("textbox", { name: "Function name" }).fill("");

		await page.locator('button[aria-label="Save"]').click();

		const functionNameErrorMessage = page.locator("text=/.*function.*required.*/i");
		await expect(functionNameErrorMessage).toBeVisible();
	});
});
