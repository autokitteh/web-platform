import { expect, test } from "e2e/fixtures";
import { waitForToast } from "e2e/utils";

test.beforeEach(async ({ dashboardPage, page }) => {
	await dashboardPage.createProjectFromMenu();

	await page.locator('button[aria-label="Add Variables"]').click();

	await page.getByLabel("Name").click();
	await page.getByLabel("Name").fill("nameVariable");
	await page.getByLabel("Value", { exact: true }).click();
	await page.getByLabel("Value").fill("valueVariable");
	await page.locator('button[aria-label="Save"]').click();

	const toast = await waitForToast(page, "Variable created successfully");
	await expect(toast).toBeVisible();
});

test.describe("Project Variables Suite", () => {
	test("Create variable with empty fields", async ({ page }) => {
		await page.locator('button[aria-label="Add Variables"]').click();
		await page.locator('button[aria-label="Save"]').click();

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
		await page.locator('button[aria-label="Save"]').click();

		await expect(page.getByText("newValueVariable")).toBeVisible();
	});

	test("Modify variable with active deployment", async ({ page }) => {
		await page.locator('button[aria-label="Close Project Settings"]').click();

		const deployButton = page.locator('button[aria-label="Deploy project"]');
		await deployButton.click();

		await page.locator('button[aria-label="Config"]').click();

		const configureButtons = page.locator('button[aria-label="Edit"]');
		await configureButtons.first().click();

		const okButton = page.locator('button[aria-label="Ok"]');
		if (await okButton.isVisible({ timeout: 2000 })) {
			await okButton.click();
		}

		await page.getByLabel("Value", { exact: true }).click();
		await page.getByLabel("Value").fill("newValueVariable");
		await page.locator('button[aria-label="Save"]').click();

		await expect(page.getByText("newValueVariable")).toBeVisible();
	});

	test("Modifying variable with empty value", async ({ page }) => {
		const configureButtons = page.locator('button[aria-label="Edit"]');
		await configureButtons.first().click();

		await page.getByRole("textbox", { name: "Value" }).clear();
		await page.locator('button[aria-label="Save"]').click();

		const valueErrorMessage = page.getByRole("alert", { name: "Value is required" });
		await expect(valueErrorMessage).toBeVisible();
	});

	test("Delete variable", async ({ page }) => {
		const deleteButton = page.locator('button[aria-label="Delete nameVariable"]');
		await deleteButton.click({ timeout: 2000 });

		const confirmButton = page.locator(`button[aria-label="Confirm and delete nameVariable"]`);
		await confirmButton.click({ timeout: 3000 });
		const toast = await waitForToast(page, "Variable removed successfully");
		await expect(toast).toBeVisible();

		await expect(page.getByText("No variables found for this project")).toBeVisible();
	});
});
