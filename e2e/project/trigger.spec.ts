import { test, expect } from "@e2e/fixtures";
import { Page } from "@playwright/test";

async function createTrigger(page: Page, name: string, cronExpression: string, fileName: string, functionName: string) {
	await page.getByRole("link", { name: "Add new" }).click();

	await page.getByRole("combobox", { name: "Select trigger type", exact: true }).click();
	await page.getByRole("option", { name: "Scheduler" }).click();

	const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
	await nameInput.click();
	await nameInput.fill(name);

	const cronInput = page.getByRole("textbox", { name: "Cron expression" });
	await cronInput.click();
	await cronInput.fill(cronExpression);

	await page.getByRole("combobox", { name: "Select file", exact: true }).click();
	await page.getByRole("option", { name: fileName }).click();

	const functionNameInput = page.getByRole("textbox", { name: "Function name" });
	await functionNameInput.click();
	await functionNameInput.fill(functionName);

	await page.getByRole("button", { name: "Save" }).click();
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

test.beforeEach(async ({ page, dashboardPage }) => {
	await dashboardPage.createProjectFromMenu();

	await page.getByRole("button", { name: "Create new file" }).click();
	const newFileInput = page.getByRole("textbox", { name: "new file name" });
	await newFileInput.click();
	await newFileInput.fill("newFile");
	await page.getByRole("button", { name: "Create", exact: true }).click();
	await expect(page.getByRole("row", { name: "newFile.star" })).toHaveCount(1);

	await page.getByRole("tab", { name: "Triggers" }).click();
});

test.describe("Project Triggers Suite", () => {
	test("Create trigger with cron expression", async ({ page }) => {
		await createTrigger(page, "triggerName", "5 4 * * *", "newFile.star", "functionName");

		const newRowInTable = page.getByRole("row", { name: "triggerName" });
		await expect(newRowInTable).toHaveCount(1);

		const newCallInTable = page.getByRole("cell", { name: "newFile.star:functionName" });
		await expect(newCallInTable).toBeVisible();
	});

	test("Modify trigger with cron expression", async ({ page }) => {
		await createTrigger(page, "triggerName", "5 4 * * *", "newFile.star", "functionName");

		const newRowInTable = page.getByRole("cell", { name: "triggerName", exact: true });
		await expect(newRowInTable).toBeVisible();

		await modifyTrigger(page, "triggerName", "4 4 * * *", "newFunctionName");

		const newCallInTable = page.getByRole("cell", { name: "newFile.star:newFunctionName" });
		await expect(newCallInTable).toBeVisible();
	});

	test("Delete trigger", async ({ page }) => {
		await createTrigger(page, "triggerName", "5 4 * * *", "newFile.star", "functionName");

		const newRowInTable = page.getByRole("cell", { name: "triggerName", exact: true });
		await expect(newRowInTable).toBeVisible();

		await page.getByRole("button", { name: "Delete triggerName trigger" }).click();
		await page.getByRole("button", { name: "Yes, delete" }).click();
		const newVariableInTable = page.getByRole("cell", { name: "triggerName", exact: true });
		await expect(newVariableInTable).not.toBeVisible();
	});
});
