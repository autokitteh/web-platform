import { test, expect } from "@playwright/test";

test.describe("Project Variable", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("");
		const button = page.getByRole("button", { name: "New Project" });
		await button.hover();
		if (await button.isVisible()) {
			await button.click();
		} else {
			test.fail();
		}
		await page.getByRole("tab", { name: "Variables" }).click();
		await page.getByRole("link", { name: "Add new" }).click();

		await page.getByPlaceholder("Name").click();
		await page.getByPlaceholder("Name").fill("nameVariable");
		await page.getByPlaceholder("Value").click();
		await page.getByPlaceholder("Value").fill("valueVariable");
		await page.getByRole("button", { name: "Save" }).click();
	});

	test("Create variable", async ({ page }) => {
		const variableInTable = page.getByRole("cell", { name: "nameVariable", exact: true });
		const variableValueInTable = page.getByRole("cell", { name: "valueVariable", exact: true });
		await expect(variableInTable).toBeVisible();
		await expect(variableValueInTable).toBeVisible();
	});

	test("Modify variable", async ({ page }) => {
		await page.getByRole("button", { name: "Modify nameVariable variable" }).click();
		await page.getByPlaceholder("Value").click();
		await page.getByPlaceholder("Value").fill("newValueVariable");
		await page.getByRole("button", { name: "Save" }).click();
		const newVariableInTable = page.getByRole("cell", { name: "newValueVariable", exact: true });
		await expect(newVariableInTable).toBeVisible();
	});

	test("Delete variable", async ({ page }) => {
		const removeVariableButton = page.getByRole("button", { name: "Delete nameVariable variable" });
		await removeVariableButton.click();
		await page.getByRole("button", { name: "Yes, delete" }).click();
		expect(await removeVariableButton.isHidden());
	});

	test.afterEach(async ({ page }) => {
		await page.goto("");
	});
});
