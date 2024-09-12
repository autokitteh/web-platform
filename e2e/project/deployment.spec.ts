import { expect, test } from "../fixtures";
import { waitForToast } from "../utils";

test.beforeEach(async ({ dashboardPage, page }) => {
	await dashboardPage.createProjectFromMenu();

	await page.getByRole("button", { name: "Create new file" }).click();
	const newFileInput = page.getByRole("textbox", { name: "new file name" });
	await newFileInput.click();
	await newFileInput.fill("newFile");
	await page.getByRole("button", { exact: true, name: "Create" }).click();
	await expect(page.getByRole("row", { name: "newFile.star" })).toHaveCount(1);
	await expect(page.getByText("// Start typing here...")).toBeVisible();
	const editor = page.getByRole("code");
	await editor.click();
	await page.keyboard.down("Shift");
	await page.keyboard.press("Home");
	await page.keyboard.up("Shift");
	await page.keyboard.press("Backspace");
	await page.keyboard.type(`def on_http_get(data): print("Received %s request" % data.method)`);
	await page.keyboard.press("Escape");
	await page.waitForTimeout(2000);

	const deployButton = page.getByRole("button", { name: "Deploy project" });
	await deployButton.click();
	const toast = await waitForToast(page, "Project deploy completed successfully.");
	await expect(toast).toBeVisible();

	await page.getByRole("link", { name: "Deployments" }).click();
});

test.describe("Project Deployment Suite", () => {
	test("New deployment has been created", async ({ page }) => {
		await expect(page.getByRole("heading", { name: "Deployment History (1)" })).toBeVisible();
		await expect(page.getByRole("status", { name: "Active" })).toBeVisible();
		const deploymentTableRow = page.locator("td").getByText(/bld_*/);
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

		await page.getByRole("button", { name: "Yes, delete" }).click();
		await expect(deleteButton).not.toBeVisible();
		await expect(page.getByText("No deployments found")).toBeVisible();
	});
});
