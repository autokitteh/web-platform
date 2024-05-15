import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
	const button = page.getByRole("button", { name: "New Project" });
	await button.hover();
	await button.click();

	await page.getByRole("button", { name: "Create new file" }).click();
	const newFileInput = page.getByRole("textbox", { name: "new file name" });
	await newFileInput.click();
	await newFileInput.fill("newFile");
	await page.getByRole("button", { name: "Create", exact: true }).click();
	await expect(page.getByRole("row", { name: "newFile.star" })).toHaveCount(1);

	await page.getByRole("button", { name: "Deploy project" }).click();
	const projectDeployedWithFile = page.getByRole("alert", { name: "Project deploy completed successfully." });
	await expect(projectDeployedWithFile).toBeVisible();

	await page.getByRole("link", { name: "View project stats" }).click();
});

test.describe("Project Deployment Suite", () => {
	test("New deployment has been created", async ({ page }) => {
		await page.waitForTimeout(1000);
		const deployment = await page.locator("tbody").locator("tr").count();
		expect(deployment).toBe(1);
	});

	test("Deactivate deployment", async ({ page }) => {
		const deactiveButton = page.getByRole("button", { name: "Deactivate deployment" });
		await deactiveButton.click();
		await expect(page.getByRole("button", { name: "Activate deployment" })).toBeVisible();
		await expect(page.getByRole("status", { name: "Inactive" })).toBeVisible();
	});

	test("Delete activated deployment", async ({ page }) => {
		await expect(page.getByRole("button", { name: "Delete deployment" })).toBeDisabled();
	});

	test("Delete deactivated deployment", async ({ page }) => {
		await page.getByRole("button", { name: "Deactivate deployment" }).click();
		const deleteButton = page.getByRole("button", { name: "Delete deployment" });
		await deleteButton.click();
		await page.getByRole("button", { name: "Yes, delete" }).click();
		await expect(deleteButton).not.toBeVisible();
	});
});
