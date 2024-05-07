import { test, expect } from "@playwright/test";

test.describe("Project Suite", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("");
		const button = page.getByRole("button", { name: "New Project" });
		await button.hover();
		if (await button.isVisible()) {
			await button.click();
		} else {
			test.fail();
		}
	});

	test("Change project name", async ({ page }) => {
		await page.getByRole("textbox", { name: "Rename" }).click();
		await page.getByRole("textbox", { name: "Rename" }).fill("Grankie_0121");
		expect(page.getByText("Grankie_0121")).toBeTruthy();
	});

	test("Create new file to project", async ({ page }) => {
		await page.getByRole("button", { name: "Create new file" }).click();
		await page.getByRole("textbox", { name: "new file name" }).click();
		await page.getByRole("textbox", { name: "new file name" }).fill("newFile");
		await page.getByRole("button", { name: "Create", exact: true }).click();
	});

	test("Tabs counters", async ({ page }) => {
		const textElement = page.getByLabel("Variables");
		const initialText = await textElement.textContent();

		await page.getByRole("tab", { name: "Variables" }).click();
		await page.getByRole("link", { name: "Add new" }).click();

		await page.getByPlaceholder("Name").click();
		await page.getByPlaceholder("Name").fill("nameVariable");
		await page.getByPlaceholder("Value").click();
		await page.getByPlaceholder("Value").fill("valueVariable");
		await page.getByRole("button", { name: "Save" }).click();
		await page.waitForTimeout(500);

		const updatedText = textElement.textContent();

		expect(updatedText).not.toBe(initialText);
	});

	test.afterEach(async ({ page }) => {
		await page.goto("");
	});
});
