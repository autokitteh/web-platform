import { expect, test } from "../fixtures";

test.describe("Project Topbar Suite", () => {
	test("Changed deployments topbar", async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();

		await expect(page.getByRole("button", { name: "Explorer" })).toHaveClass(/active/);
		await expect(page.getByRole("button", { name: "Deployments" })).not.toHaveClass(/active/);
		await expect(page.getByRole("button", { name: "Sessions" })).toBeDisabled();
		await page.getByRole("button", { name: "Close Project Settings" }).click();

		const deployButton = page.getByRole("button", { name: "Deploy project", exact: true });
		await deployButton.click();

		await page.getByRole("button", { name: "Deployments" }).click();

		await expect(page.getByRole("button", { name: "Explorer" })).not.toHaveClass(/active/);
		await expect(page.getByRole("button", { name: "Deployments" })).toHaveClass(/active/);

		const activeStatus = page.getByText("Active").first();
		await activeStatus.click();

		await expect(page.getByRole("button", { name: "Explorer" })).not.toHaveClass(/active/);
		await expect(page.getByRole("button", { name: "Deployments", exact: true })).not.toHaveClass(/active/);
		await expect(page.getByRole("button", { name: "Sessions" })).toHaveClass(/active/);
	});
});
