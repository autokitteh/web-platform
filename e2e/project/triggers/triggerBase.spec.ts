import type { Page } from "@playwright/test";

import { expect, test } from "e2e/fixtures";
import { waitForToast } from "e2e/utils";

const triggerName = "triggerName";
const testModifyCases = [
	{
		description: "without active deployment",
		modifyParams: {
			cron: "4 4 * * *",
			functionName: "newFunctionName",
			withActiveDeployment: false,
		},
		expectedFileFunction: "program.py:newFunctionName",
	},
	{
		description: "with active deployment",
		modifyParams: {
			cron: "4 4 * * *",
			functionName: "newFunctionName",
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
	functionName: string
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
	await functionNameInput.fill(functionName);

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
		const deployButton = page.getByRole("button", { name: "Deploy project" });
		await deployButton.click();
		const toast = await waitForToast(page, "Project deployment completed successfully");
		await expect(toast).toBeVisible();
	}

	await page.getByRole("button", { name: `Modify ${name} trigger` }).click();

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

async function verifyFormValues(page: Page, cronValue: string, functionName: string) {
	const cronInput = page.getByRole("textbox", { name: "Cron expression" });
	await expect(cronInput).toHaveValue(cronValue);

	const functionNameInput = page.getByRole("textbox", { name: "Function name" });
	await expect(functionNameInput).toHaveValue(functionName);
}

async function verifyTriggerInTable(page: Page, name: string, fileFunction: string) {
	const newRowInTable = page.getByRole("cell", { exact: true, name });
	await expect(newRowInTable).toBeVisible();

	const newCellInTable = page.getByRole("cell", { name: fileFunction });
	await expect(newCellInTable).toBeVisible();
}

test.describe("Project Triggers Suite", () => {
	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		await page.getByRole("tab", { name: "Triggers" }).click();
	});

	test("Create trigger with cron expression", async ({ page }) => {
		await createTriggerScheduler(page, triggerName, "5 4 * * *", "program.py", "on_trigger");

		await page.getByRole("button", { name: "Return back" }).click();

		const newRowInTable = page.getByRole("row", { name: triggerName });
		await expect(newRowInTable).toHaveCount(1);

		const newCellInTable = page.getByRole("cell", { name: "program.py:on_trigger" });
		await expect(newCellInTable).toBeVisible();
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
					modifyParams.functionName,
					modifyParams.withActiveDeployment
				);

				await verifyFormValues(page, modifyParams.cron, modifyParams.functionName);
				await page.getByRole("button", { name: "Return back" }).click();
				await verifyTriggerInTable(page, triggerName, expectedFileFunction);
			});
		});
	});

	test("Delete trigger", async ({ page }) => {
		await createTriggerScheduler(page, "triggerName", "5 4 * * *", "program.py", "on_trigger");
		await page.getByRole("button", { name: "Return back" }).click();
		const newRowInTable = page.getByRole("cell", { exact: true, name: "triggerName" });
		await expect(newRowInTable).toBeVisible();

		await page.getByRole("button", { name: "Delete triggerName trigger" }).click();
		await page.getByRole("button", { name: "Ok", exact: true }).click();
		const newVariableInTable = page.getByRole("cell", { exact: true, name: "triggerName" });
		await expect(newVariableInTable).not.toBeVisible();
		const noTriggersMessage = page.getByText("ADD TRIGGER");
		await expect(noTriggersMessage).toBeVisible();
	});

	test("Create trigger without a values", async ({ page }) => {
		await page.getByRole("button", { name: "Add new" }).click();
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

		await page.getByRole("button", { name: "Modify triggerName trigger" }).click();
		await page.getByRole("textbox", { name: "Cron expression" }).click();
		await page.getByRole("textbox", { name: "Cron expression" }).fill("");

		await page.getByRole("textbox", { name: "Function name" }).click();
		await page.getByRole("textbox", { name: "Function name" }).fill("");

		await page.getByRole("button", { name: "Save", exact: true }).click();

		const functionNameErrorMessage = page.locator("text=/.*function.*required.*/i");
		await expect(functionNameErrorMessage).toBeVisible();
	});
});
