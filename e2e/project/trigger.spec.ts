import { test, expect } from "@e2e/fixtures";

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
		await page.getByRole("link", { name: "Add new" }).click();

		await page.getByRole("combobox", { name: "Select trigger type" }).click();
		await page.getByRole("option", { name: "Scheduler" }).click();

		const newNameInput = page.getByRole("textbox", { name: "Name", exact: true });
		await newNameInput.click();
		await newNameInput.fill("triggerName");
		const newCronInput = page.getByRole("textbox", { name: "Cron expression" });
		await newCronInput.click();
		await newCronInput.fill("5 4 * * *");

		await page.getByRole("combobox", { name: "Select file" }).click();
		await page.getByRole("option", { name: "newFile.star" }).click();

		const newFunctionNameInput = page.getByRole("textbox", { name: "Function name" });
		await newFunctionNameInput.click();
		await newFunctionNameInput.fill("functionName");

		await page.getByRole("button", { name: "Save" }).click();

		const newRowInTable = page.getByRole("row", { name: "triggerName" });
		await expect(newRowInTable).toHaveCount(1);

		const newCallInTable = page.getByRole("cell", { name: "newFile.star:functionName" });
		await expect(newCallInTable).toBeVisible();
	});
});
