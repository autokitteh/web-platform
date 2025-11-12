import { expect, test } from "e2e/fixtures";
import { waitForToast } from "e2e/utils";

test.beforeEach(async ({ dashboardPage, page }) => {
	await dashboardPage.createProjectFromMenu();

	await page.getByRole("button", { name: "Add Variables" }).click();

	await page.getByLabel("Name").click();
	await page.getByLabel("Name").fill("nameVariable");
	await page.getByLabel("Value", { exact: true }).click();
	await page.getByLabel("Value").fill("valueVariable");
	await page.getByRole("button", { name: "Save", exact: true }).click();

	const toast = await waitForToast(page, "Variable created successfully");
	await expect(toast).toBeVisible();
});

test.describe("Project Variables Suite", () => {
	test("Create variable with empty fields", async ({ page }) => {
		await page.getByRole("button", { name: "Add Variables" }).click();
		await page.getByRole("button", { name: "Save", exact: true }).click();

		const nameErrorMessage = page.getByRole("alert", { name: "Name is required" });
		const valueErrorMessage = page.getByRole("alert", { name: "Value is required" });
		await expect(nameErrorMessage).toBeVisible();
		await expect(valueErrorMessage).toBeVisible();
	});

	test("Modify variable", async ({ page }) => {
		const configureButtons = page.locator('button[aria-label="Edit"]');
		await configureButtons.first().click();

		await page.getByLabel("Value", { exact: true }).click();
		await page.getByLabel("Value").fill("newValueVariable");
		await page.getByRole("button", { name: "Save", exact: true }).click();

		await expect(page.getByText("newValueVariable")).toBeVisible();
	});

	test("Modify variable with active deployment", async ({ page }) => {
		await page.getByRole("button", { name: "Close Project Settings" }).click();

		const deployButton = page.getByRole("button", { name: "Deploy" });
		await deployButton.click();

		await page.getByRole("button", { name: "Config" }).click();

		const configureButtons = page.locator('button[aria-label="Edit"]');
		await configureButtons.first().click();

		const okButton = page.getByRole("button", { name: "Ok" });
		if (await okButton.isVisible({ timeout: 2000 })) {
			await okButton.click();
		}

		await page.getByLabel("Value", { exact: true }).click();
		await page.getByLabel("Value").fill("newValueVariable");
		await page.getByRole("button", { name: "Save", exact: true }).click();

		await expect(page.getByText("newValueVariable")).toBeVisible();
	});

	test("Modifying variable with empty value", async ({ page }) => {
		const configureButtons = page.locator('button[aria-label="Edit"]');
		await configureButtons.first().click();

		await page.getByRole("textbox", { name: "Value" }).clear();
		await page.getByRole("button", { name: "Save", exact: true }).click();

		const valueErrorMessage = page.getByRole("alert", { name: "Value is required" });
		await expect(valueErrorMessage).toBeVisible();
	});

	test("Delete variable", async ({ page }) => {
		const deleteButtons = page.locator('button[aria-label="Delete"]');
		await deleteButtons.first().click();

		const okButton = page.getByRole("button", { name: "Ok" });
		await expect(okButton).toBeVisible();
		await okButton.click();

		const emptyTableMessage = page.getByText("No variables found");
		await expect(emptyTableMessage).toBeVisible();
	});
});
