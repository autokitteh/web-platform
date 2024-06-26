import { test, expect } from "@e2e/fixtures";
import { waitForToast } from "@e2e/utils";

test.beforeEach(async ({ page, dashboardPage }) => {
	await dashboardPage.createProjectFromMenu();

	await page.getByRole("button", { name: "Create new file" }).click();
	const newFileInput = page.getByRole("textbox", { name: "new file name" });
	await newFileInput.click();
	await newFileInput.fill("newFile");
	await page.getByRole("button", { name: "Create", exact: true }).click();
	await expect(page.getByRole("row", { name: "newFile.star" })).toHaveCount(1);
	await expect(page.getByText("// Start typing here...")).toBeVisible();
	await page.getByRole("button", { name: "Deploy project" }).click();
	const toast = await waitForToast(page, "Project deploy completed successfully.");
	await expect(toast).toBeVisible();

	await page.getByRole("link", { name: "View project stats" }).click();
});

test.describe("Project Deployment Suite", () => {
	test("New deployment has been created", async ({ page }) => {
		await page.waitForTimeout(1000);
		const deploymentCount = await page.locator("tbody").locator("tr").count();
		expect(deploymentCount).toBe(1);
	});

	test("Deactivate deployment", async ({ page }) => {
		const deactivateButton = page.getByRole("button", { name: "Deactivate deployment" });
		await deactivateButton.click();
		await expect(page.getByRole("button", { name: "Activate deployment" })).toBeVisible();
		await expect(page.getByRole("status", { name: "Inactive" })).toBeVisible();
	});

	test("Delete activated deployment", async ({ page }) => {
		await expect(page.getByRole("button", { name: "Delete deployment" })).toBeDisabled();
	});

	test("Delete deactivated deployment", async ({ page }) => {
		const deactivateButton = page.getByRole("button", { name: "Deactivate deployment" });
		await deactivateButton.click();
		const deleteButton = page.getByRole("button", { name: "Delete deployment" });
		await deleteButton.click();
		await page.getByRole("button", { name: "Yes, delete" }).click();
		await expect(deleteButton).not.toBeVisible();
	});
});
