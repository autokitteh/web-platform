import { Page } from "@playwright/test";

import { expect, test } from "@e2e/fixtures";

const triggerName = "triggerName";

async function createTriggerScheduler(
	page: Page,
	name: string,
	cronExpression: string,
	fileName: string,
	functionName: string
) {
	await page.getByRole("link", { name: "Add new" }).click();

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

	await page.getByRole("button", { name: "Save" }).click();

	await expect(nameInput).toBeDisabled();
	await expect(nameInput).toHaveValue(triggerName);
}

async function modifyTrigger(page: Page, name: string, cronExpression: string, functionName: string) {
	await page.getByRole("button", { name: `Modify ${name} trigger` }).click();

	const cronInput = page.getByRole("textbox", { name: "Cron expression" });
	await cronInput.click();
	await cronInput.fill(cronExpression);

	const functionNameInput = page.getByRole("textbox", { name: "Function name" });
	await functionNameInput.click();
	await functionNameInput.fill(functionName);

	await page.getByRole("button", { name: "Save" }).click();
}

test.beforeEach(async ({ dashboardPage, page }) => {
	await dashboardPage.createProjectFromMenu();

	await page.getByRole("button", { name: "Create new file" }).click();
	const newFileInput = page.getByRole("textbox", { name: "new file name" });
	await newFileInput.click();
	await newFileInput.fill("newFile");
	await page.getByRole("button", { exact: true, name: "Create" }).click();
	await expect(page.getByRole("row", { name: "newFile.star" })).toHaveCount(1);

	await page.getByRole("tab", { name: "Triggers" }).click();
});

test.describe("Project Triggers Suite", () => {
	test("Create trigger with cron expression", async ({ page }) => {
		await createTriggerScheduler(page, triggerName, "5 4 * * *", "newFile.star", "functionName");

		const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
		await expect(nameInput).toBeDisabled();
		await expect(nameInput).toHaveValue(triggerName);

		await page.getByRole("button", { name: "Return back" }).click();

		const newRowInTable = page.getByRole("row", { name: "triggerName" });
		await expect(newRowInTable).toHaveCount(1);

		const newCellInTable = page.getByRole("cell", { name: "newFile.star:functionName" });
		await expect(newCellInTable).toBeVisible();
	});

	test("Modify trigger with cron expression", async ({ page }) => {
		await createTriggerScheduler(page, triggerName, "5 4 * * *", "newFile.star", "functionName");

		await page.getByRole("button", { name: "Return back" }).click();

		await modifyTrigger(page, triggerName, "4 4 * * *", "newFunctionName");

		const cronInput = page.getByRole("textbox", { name: "Cron expression" });
		await expect(cronInput).toHaveValue("4 4 * * *");

		const functionNameInput = page.getByRole("textbox", { name: "Function name" });
		await expect(functionNameInput).toHaveValue("newFunctionName");

		const backButton = page.getByRole("button", { name: "Return back" });
		await backButton.click();

		const newRowInTable = page.getByRole("cell", { exact: true, name: "triggerName" });
		await expect(newRowInTable).toBeVisible();

		const newCellInTable = page.getByRole("cell", { name: "newFile.star:newFunctionName" });
		await expect(newCellInTable).toBeVisible();
	});

	test("Delete trigger", async ({ page }) => {
		await createTriggerScheduler(page, "triggerName", "5 4 * * *", "newFile.star", "functionName");
		await page.getByRole("button", { name: "Return back" }).click();
		const newRowInTable = page.getByRole("cell", { exact: true, name: "triggerName" });
		await expect(newRowInTable).toBeVisible();

		await page.getByRole("button", { name: "Delete triggerName trigger" }).click();
		await page.getByRole("button", { name: "Yes, delete" }).click();
		const newVariableInTable = page.getByRole("cell", { exact: true, name: "triggerName" });
		await expect(newVariableInTable).not.toBeVisible();
		const noTriggersMessage = page.getByText("No triggers available.");
		await expect(noTriggersMessage).toBeVisible();
	});

	test("Create trigger without a values", async ({ page }) => {
		await page.getByRole("link", { name: "Add new" }).click();
		await page.getByTestId("select-trigger-type").click();
		await page.getByRole("option", { name: "Scheduler" }).click();
		await page.getByTestId("select-file").click();
		await page.getByRole("option", { name: "newFile.star" }).click();
		await page.getByRole("button", { name: "Save" }).click();
		const nameErrorMessage = page.getByText("Name is required");

		await expect(nameErrorMessage).toBeVisible();
		const nameInput = page.getByRole("textbox", { exact: true, name: "Name" });
		await nameInput.click();
		await nameInput.fill("triggerTest");
		await page.getByRole("button", { name: "Save" }).click();

		const functionNameErrorMessage = page.getByText("Function is required");

		await expect(functionNameErrorMessage).toBeVisible();
	});

	test("Modify trigger without a values", async ({ page }) => {
		await createTriggerScheduler(page, "triggerName", "5 4 * * *", "newFile.star", "functionName");
		await page.getByRole("button", { name: "Return back" }).click();

		await page.getByRole("button", { name: "Modify triggerName trigger" }).click();
		await page.getByRole("textbox", { name: "Cron expression" }).click();
		await page.getByRole("textbox", { name: "Cron expression" }).fill("");

		await page.getByRole("textbox", { name: "Function name" }).click();
		await page.getByRole("textbox", { name: "Function name" }).fill("");

		await page.getByRole("button", { name: "Save" }).click();

		const functionNameErrorMessage = page.getByText("Function is required");

		await expect(functionNameErrorMessage).toBeVisible();
	});
});
