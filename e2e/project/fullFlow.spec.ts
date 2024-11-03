import { expect, test } from "../fixtures";
import { waitForToast } from "../utils";

test.beforeEach(async ({ dashboardPage, page }) => {
	await dashboardPage.createProjectFromTemplate();

	const deployButton = page.getByRole("button", { name: "Deploy project" });
	await deployButton.click();
	const toast = await waitForToast(page, "Project deployment completed successfully");
	await expect(toast).toBeVisible();

	await page.getByRole("button", { name: "Deployments" }).click();
});

test.describe("Project Deployment Suite", () => {
	test("New deployment has been created", async ({ page }) => {
		await expect(page.getByRole("heading", { name: "Deployment History (1)" })).toBeVisible();
		await expect(page.getByRole("status", { name: "Active" })).toBeVisible();
		const deploymentTableRow = page.getByRole("cell", { name: /bld_*/ });

		await expect(deploymentTableRow).toHaveCount(1);
	});
});
