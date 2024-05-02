import { EProjectTabs } from "@enums/components";
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
	const button = page.getByRole("button", { name: "New Project" });
	await button.hover();
	await button.click();

	await page.getByRole("tab", { name: EProjectTabs.variables }).click();
	await page.getByRole("link", { name: "Add new" }).click();

	await page.getByPlaceholder("Name").click();
	await page.getByPlaceholder("Name").fill("nameVariable");
	await page.getByPlaceholder("Value").click();
	await page.getByPlaceholder("Value").fill("valueVariable");
	await page.getByRole("button", { name: "Save" }).click();

	const variableInTable = page.getByRole("cell", { name: "nameVariable", exact: true });
	const variableValueInTable = page.getByRole("cell", { name: "valueVariable", exact: true });
	await expect(variableInTable).toBeVisible();
	await expect(variableValueInTable).toBeVisible();
});

test.describe("Project Variables Suite", () => {
	test("Create variable with empty fields", async ({ page }) => {
		await page.getByRole("link", { name: "Add new" }).click();
		await page.getByRole("button", { name: "Save" }).click();

		const nameErrorMessage = page.getByRole("alert", { name: "Name is required" });
		const valueErrorMessage = page.getByRole("alert", { name: "Value is required" });
		await expect(nameErrorMessage).toBeVisible();
		await expect(valueErrorMessage).toBeVisible();
	});

	test("Modify variable", async ({ page }) => {
		await page.getByRole("button", { name: "Modify nameVariable variable" }).click();
		await page.getByPlaceholder("Value").click();
		await page.getByPlaceholder("Value").fill("newValueVariable");
		await page.getByRole("button", { name: "Save" }).click();
		const newVariableInTable = page.getByRole("cell", { name: "newValueVariable", exact: true });
		await expect(newVariableInTable).toBeVisible();
	});

	test("Modifying variable with empty value", async ({ page }) => {
		await page.getByRole("button", { name: "Modify nameVariable variable" }).click();
		await page.getByPlaceholder("Value").clear();
		await page.getByRole("button", { name: "Save" }).click();

		const valueErrorMessage = page.getByRole("alert", { name: "Value is required" });
		await expect(valueErrorMessage).toBeVisible();
	});

	test("Delete variable", async ({ page }) => {
		await page.getByRole("button", { name: "Delete nameVariable variable" }).click();
		await page.getByRole("button", { name: "Yes, delete" }).click();
		const newVariableInTable = page.getByRole("cell", { name: "newValueVariable", exact: true });
		await expect(newVariableInTable).not.toBeVisible();
	});
});
