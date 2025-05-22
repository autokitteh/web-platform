import { expect, test } from "../fixtures";
import { waitForToast } from "../utils";

test.beforeEach(async ({ dashboardPage, page }) => {
	await dashboardPage.createProjectFromMenu();

	const deployButton = page.getByRole("button", { name: "Deploy project" });
	await deployButton.click();
	const toast = await waitForToast(page, "Project successfully deployed with 1 warning");
	await expect(toast).toBeVisible();

	await page.getByRole("button", { name: "Deployments" }).click();
	await page.waitForLoadState("networkidle");
	await expect(page.getByRole("heading", { name: /Deployment History/ })).toBeVisible();
});

test.describe("Project Deployment Suite", () => {
	test("New deployment has been created", async ({ page }) => {
		await expect(page.getByRole("heading", { name: "Deployment History (1)" })).toBeVisible();
		await expect(page.getByRole("status", { name: "Active" })).toBeVisible();
		const deploymentTableRow = page.getByRole("cell", { name: /bld_*/ });

		await expect(deploymentTableRow).toHaveCount(1);
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

		await page.getByRole("button", { name: "Ok" }).click();
		await expect(deleteButton).not.toBeVisible();
		await expect(page.getByText("No deployments found")).toBeVisible();
	});
});
