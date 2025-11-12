import { expect, test } from "../fixtures";
import { waitForToast } from "../utils";

test.beforeEach(async ({ dashboardPage, page }) => {
	await dashboardPage.createProjectFromMenu();
	await page.locator('button[aria-label="Deploy project"]').click();

	const toast = await waitForToast(page, "Project successfully deployed with 1 warning");
	await expect(toast).toBeVisible();

	await page.getByRole("button", { name: "Deployments" }).click();
	await expect(page.getByText("Deployment History")).toBeVisible();
	await page.getByRole("button", { name: "Close Project Settings" }).click();
});

test.describe("Project Deployment Suite", () => {
	test("New deployment has been created", async ({ page }) => {
		await expect(page.getByText("Deployment History")).toBeVisible();
		await expect(page.getByText("Active").first()).toBeVisible();
	});

	test("Deactivate deployment", async ({ page }) => {
		const deactivateButton = page.getByRole("button", { name: "Deactivate deployment" });
		await deactivateButton.click();
		await expect(page.getByRole("button", { name: "Activate deployment" })).toBeVisible();
		await expect(page.getByText("Inactive").first()).toBeVisible();
	});

	test("Delete activated deployment", async ({ page }) => {
		const deleteButton = page.getByRole("button", { name: "Delete deployment" });
		await expect(deleteButton).toBeDisabled();
	});

	test("Delete deactivated deployment", async ({ page }) => {
		const deactivateButton = page.getByRole("button", { name: "Deactivate deployment" });
		await deactivateButton.click();
		const deleteButton = page.getByRole("button", { name: "Delete deployment" });
		await deleteButton.click();

		await page.getByRole("button", { name: "Ok" }).click();
		await expect(deleteButton).not.toBeVisible();
		await expect(page.getByText("No deployments found")).toBeVisible();
	});
});
