/* eslint-disable @typescript-eslint/naming-convention */
import type { Page } from "@playwright/test";

import { expect, test } from "e2e/fixtures";

const triggerName = "triggerName";
const testModifyCases = [
	{
		description: "without active deployment",
		modifyParams: {
			cron: "4 4 * * *",
			on_trigger: "newFunctionName",
			withActiveDeployment: false,
		},
		expectedFileFunction: "program.py:newFunctionName",
	},
	{
		description: "with active deployment",
		modifyParams: {
			cron: "4 4 * * *",
			on_trigger: "newFunctionName",
			withActiveDeployment: true,
		},
		expectedFileFunction: "program.py:newFunctionName",
	},
];

async function createTriggerScheduler(
	page: Page,
	name: string,
	cronExpression: string,
	fileName: string,
	on_trigger: string
) {
	await page.getByRole("button", { name: "Add Triggers" }).click();

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

	await page.getByRole("button", { name: "Save", exact: true }).click();

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
		await page.getByRole("button", { name: "Close Project Settings" }).click();
		const deployButton = page.getByRole("button", { name: "Deploy" });
		await deployButton.click();
		await page.getByRole("button", { name: "Config" }).click();
	}

	const configureButtons = page.locator('button[aria-label="Edit"]');
	await configureButtons.first().click();

	if (withActiveDeployment) {
		await expect(page.getByText("Changes might affect the currently running deployments.")).toBeVisible();
		await page.getByRole("button", { name: "Ok" }).click();
	}

	const cronInput = page.getByRole("textbox", { name: "Cron expression" });
	await cronInput.click();
	await cronInput.fill(newCronExpression);

	const functionNameInput = page.getByRole("textbox", { name: "Function name" });
	await functionNameInput.click();
	await functionNameInput.fill(newFunctionName);

	await page.getByRole("button", { name: "Save", exact: true }).click();
}

async function verifyFormValues(page: Page, cronValue: string, on_trigger: string) {
	await page
		.getByRole("button", { name: `Trigger information for "${triggerName}"` })
		.first()
		.hover();
	const cronInput = page.getByRole("textbox", { name: "Cron expression" });
	await expect(cronInput).toHaveValue(cronValue);

	const functionNameInput = page.getByRole("textbox", { name: "Function name" });
	await expect(functionNameInput).toHaveValue(on_trigger);
}

async function verifyTriggerInTable(page: Page, name: string, fileFunction: string) {
	await expect(page.getByText(name)).toBeVisible();
	await page
		.getByRole("button", { name: `Trigger information for "${name}"` })
		.first()
		.hover();
	await expect(page.getByText(fileFunction)).toBeVisible();
}

test.describe("Project Triggers Suite", () => {
	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		const configButton = page.getByRole("button", { name: "Config" });
		await expect(configButton).toBeEnabled();
		await configButton.click();
	});

	test("Create trigger with cron expression", async ({ page }) => {
		await createTriggerScheduler(page, triggerName, "5 4 * * *", "program.py", "on_trigger");

		await page.getByRole("button", { name: "Return back" }).click();

		await expect(page.getByText(triggerName)).toBeVisible();
		await expect(page.getByRole("button", { name: `Trigger information for "${triggerName}"` })).toBeVisible();
	});

	test.describe("Modify trigger with cron expression", () => {
		testModifyCases.forEach(({ description, expectedFileFunction, modifyParams }) => {
			test(`Modify trigger ${description}`, async ({ page }) => {
				await createTriggerScheduler(page, triggerName, "5 4 * * *", "program.py", "on_trigger");
				await page.getByRole("button", { name: "Return back" }).click();

				await modifyTrigger(
					page,
					triggerName,
					modifyParams.cron,
					modifyParams.on_trigger,
					modifyParams.withActiveDeployment
				);

				await verifyFormValues(page, modifyParams.cron, modifyParams.on_trigger);
				await verifyTriggerInTable(page, triggerName, expectedFileFunction);
			});
		});
	});

	test("Delete trigger", async ({ page }) => {
		await createTriggerScheduler(page, "triggerName", "5 4 * * *", "program.py", "on_trigger");
		await page.getByRole("button", { name: "Return back" }).click();
		await expect(page.getByText("triggerName")).toBeVisible();

		const deleteButtons = page.locator('button[aria-label="Delete"]');
		await deleteButtons.first().click();
		await page.getByRole("button", { name: "Ok", exact: true }).click();
		const noTriggersMessage = page.getByText("No triggers found");
		await expect(noTriggersMessage).toBeVisible();
	});

	test("Create trigger without a values", async ({ page }) => {
		await page.getByRole("button", { name: "Add Triggers" }).click();
		await page.getByTestId("select-trigger-type").click();
		await page.getByRole("option", { name: "Scheduler" }).click();
		await page.getByTestId("select-file").click();
		await page.getByRole("option", { name: "program.py" }).click();
		await page.getByRole("button", { name: "Save", exact: true }).click();
		const nameErrorMessage = page.getByText("Name is required");

		await expect(nameErrorMessage).toBeVisible();
		const nameInput = page.getByRole("textbox", { exact: true, name: "Name" });
		await nameInput.click();
		await nameInput.fill("triggerTest");
		await page.getByRole("button", { name: "Save", exact: true }).click();

		const functionNameErrorMessage = page.locator("text=/.*function.*required.*/i");
		await expect(functionNameErrorMessage).toBeVisible();
	});

	test("Modify trigger without a values", async ({ page }) => {
		await createTriggerScheduler(page, "triggerName", "5 4 * * *", "program.py", "on_trigger");
		await page.getByRole("button", { name: "Return back" }).click();

		const configureButtons = page.locator('button[aria-label="Edit"]');
		await configureButtons.first().click();
		await page.getByRole("textbox", { name: "Cron expression" }).click();
		await page.getByRole("textbox", { name: "Cron expression" }).fill("");

		await page.getByRole("textbox", { name: "Function name" }).click();
		await page.getByRole("textbox", { name: "Function name" }).fill("");

		await page.getByRole("button", { name: "Save", exact: true }).click();

		const functionNameErrorMessage = page.locator("text=/.*function.*required.*/i");
		await expect(functionNameErrorMessage).toBeVisible();
	});
});
