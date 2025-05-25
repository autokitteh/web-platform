import { expect, test } from "../fixtures";
import { waitForToast } from "../utils";

test.describe("Project Topbar Suite", () => {
	test("Changed deployments topbar", async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();

		await expect(page.getByRole("button", { name: "Assets" })).toHaveClass(/active/);
		await expect(page.getByRole("button", { name: "Deployments" })).not.toHaveClass(/active/);
		await expect(page.getByRole("button", { name: "Sessions" })).toBeDisabled();

		const deployButton = page.getByRole("button", { name: "Deploy project" });
		await deployButton.click();
		const toast = await waitForToast(page, "Project successfully deployed with 1 warning");
		await expect(toast).toBeVisible();

		await page.getByRole("button", { name: "Deployments" }).click();

		await expect(page.getByRole("button", { name: "Assets" })).not.toHaveClass(/active/);
		await expect(page.getByRole("button", { name: "Deployments" })).toHaveClass(/active/);

		await page.getByRole("status", { name: "Active" }).click();

		await expect(page.getByRole("button", { name: "Assets" })).not.toHaveClass(/active/);
		await expect(page.getByRole("button", { name: "Deployments" })).not.toHaveClass(/active/);
		await expect(page.getByRole("button", { name: "Sessions" })).toHaveClass(/active/);
	});
});
