import { expect, test } from "@e2e/fixtures";

test.beforeEach(async ({ dashboardPage, page }) => {
	await dashboardPage.createProjectFromMenu();

	await page.getByRole("tab", { name: "Connections" }).click();

	await page.getByRole("button", { name: "Add new" }).click();

	await page.getByRole("textbox", { exact: true, name: "Name" }).fill("NewAWS");

	await page.getByTestId("select-connection-type").click();
	await page.getByRole("option", { name: "AWS" }).click();

	await page.getByTestId("select-aws-region").click();
	await page.getByRole("option", { name: "eu-west-3" }).click();

	await page.getByRole("textbox", { exact: true, name: "Access Key" }).fill("AccessKey");
	await page.getByRole("textbox", { exact: true, name: "Secret Key" }).fill("SecretKey");
	await page.getByRole("textbox", { exact: true, name: "Token" }).fill("Token");
});

test.describe("Project Connection AWS", () => {
	test("Create AWS", async ({ page }) => {
		await page.getByRole("button", { name: "Save Connection" }).click();

		const newNameInTable = page.getByRole("row", { name: "NewAWS" });
		const newAppInTable = page.getByRole("row", { name: "AWS" });
		await expect(newNameInTable).toHaveCount(1);
		await expect(newAppInTable).toHaveCount(1);
	});

	test("Delete AWS", async ({ page }) => {
		await page.getByRole("button", { name: "Save Connection" }).click();

		const newNameInTable = page.getByRole("row", { name: "NewAWS" });
		const newAppInTable = page.getByRole("row", { name: "AWS" });
		await expect(newNameInTable).toHaveCount(1);
		await expect(newAppInTable).toHaveCount(1);

		await page.getByRole("button", { name: "Remove connection" }).click();
		await page.getByRole("button", { name: "Yes, delete" }).click();
		const newVariableInTable = page.getByRole("cell", { name: "NewAWS" });
		await expect(newVariableInTable).not.toBeVisible();
	});
});
