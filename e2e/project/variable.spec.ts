import { expect, test } from "../fixtures";

test.beforeEach(async ({ dashboardPage, page }) => {
	await dashboardPage.createProjectFromMenu();

	await page.getByRole("tab", { name: "variables" }).click();
	await page.getByRole("link", { name: "Add new" }).click();

	await page.getByLabel("Name").click();
	await page.getByLabel("Name").fill("nameVariable");
	await page.getByLabel("Value").click();
	await page.getByLabel("Value").fill("valueVariable");
	await page.getByRole("button", { name: "Save", exact: true }).click();

	const variableInTable = page.getByRole("cell", { exact: true, name: "nameVariable" });
	const variableValueInTable = page.getByRole("cell", { exact: true, name: "valueVariable" });
	await expect(variableInTable).toBeVisible();
	await expect(variableValueInTable).toBeVisible();
});

test.describe("Project Variables Suite", () => {
	test("Create variable with empty fields", async ({ page }) => {
		await page.getByRole("link", { name: "Add new" }).click();
		await page.getByRole("button", { name: "Save", exact: true }).click();

		const nameErrorMessage = page.getByRole("alert", { name: "Name is required" });
		const valueErrorMessage = page.getByRole("alert", { name: "Value is required" });
		await expect(nameErrorMessage).toBeVisible();
		await expect(valueErrorMessage).toBeVisible();
	});

	test("Modify variable", async ({ page }) => {
		await page.getByRole("button", { name: "Modify nameVariable variable" }).click();
		await page.getByLabel("Value").click();
		await page.getByLabel("Value").fill("newValueVariable");
		await page.getByRole("button", { name: "Save", exact: true }).click();
		await page.getByRole("button", { name: "Ok", exact: true }).click();
		const newVariableInTable = page.getByRole("cell", { exact: true, name: "newValueVariable" });
		await expect(newVariableInTable).toBeVisible();
	});

	test("Modifying variable with empty value", async ({ page }) => {
		await page.getByRole("button", { name: "Modify nameVariable variable" }).click();
		await page.getByRole("textbox", { name: "Value" }).clear();
		await page.getByRole("button", { name: "Save", exact: true }).click();

		const valueErrorMessage = page.getByRole("alert", { name: "Value is required" });
		await expect(valueErrorMessage).toBeVisible();
	});

	test("Delete variable", async ({ page }) => {
		await page.getByRole("button", { name: "Delete nameVariable variable" }).click();
		await page.getByRole("button", { name: "Ok", exact: true }).click();
		const newVariableInTable = page.getByRole("cell", { exact: true, name: "newValueVariable" });
		const emptyTableMessage = page.getByText("ADD VARIABLE");
		await expect(emptyTableMessage).toBeVisible();
		await expect(newVariableInTable).not.toBeVisible();
	});
});
