import { test, expect } from "@playwright/test";

test("Project variable", async ({ page }) => {
	await test.step("Create variable", async () => {
		await page.goto("/");
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

	await test.step("Modify variable", async () => {
		await page.getByRole("button", { name: "Modify nameVariable variable" }).click();
		await page.getByPlaceholder("Value").click();
		await page.getByPlaceholder("Value").fill("newValueVariable");
		await page.getByRole("button", { name: "Save" }).click();
		const newVariableInTable = page.getByRole("cell", { name: "newValueVariable", exact: true });
		await page.waitForTimeout(500);
		await expect(newVariableInTable).toBeVisible();
	});

	await test.step("Delete variable", async () => {
		await page.getByRole("button", { name: "Delete nameVariable variable" }).click();
		await page.getByRole("button", { name: "Yes, delete" }).click();
		const newVariableInTable = page.getByRole("cell", { name: "newValueVariable", exact: true });
		await page.waitForTimeout(500);
		await expect(newVariableInTable).toBeHidden();
	});
});
