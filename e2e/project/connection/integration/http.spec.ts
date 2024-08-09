import { expect, test } from "@e2e/fixtures";

test.beforeEach(async ({ dashboardPage, page }) => {
	await dashboardPage.createProjectFromMenu();

	await page.getByRole("tab", { name: "Connections" }).click();

	await page.getByRole("button", { name: "Add new" }).click();

	const nameInput = page.getByRole("textbox", { exact: true, name: "Name" });
	await nameInput.click();
	await nameInput.fill("NewHTTP");

	await page.getByTestId("select-connection-type").click();
	await page.getByRole("option", { name: "HTTP" }).click();
});

test.describe("Project Connection HTTP", () => {
	test("Create HTTP no Auth", async ({ page }) => {
		await page.getByRole("button", { name: "Save Connection" }).click();

		const newNameInTable = page.getByRole("row", { name: "NewHTTP" });
		const newAppInTable = page.getByRole("row", { name: "HTTP" });
		await expect(newNameInTable).toHaveCount(1);
		await expect(newAppInTable).toHaveCount(1);
	});

	test("Delete HTTP", async ({ page }) => {
		await page.getByRole("button", { name: "Save Connection" }).click();

		const newNameInTable = page.getByRole("row", { name: "NewHTTP" });
		const newAppInTable = page.getByRole("row", { name: "HTTP" });
		await expect(newNameInTable).toHaveCount(1);
		await expect(newAppInTable).toHaveCount(1);

		await page.getByRole("button", { name: "Remove connection" }).click();
		await page.getByRole("button", { name: "Yes, delete" }).click();
		const newVariableInTable = page.getByRole("cell", { name: "NewHTTP" });
		await expect(newVariableInTable).not.toBeVisible();
	});
});
