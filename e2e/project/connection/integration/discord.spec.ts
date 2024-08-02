import { expect, test } from "@e2e/fixtures";

test.beforeEach(async ({ dashboardPage, page }) => {
	await dashboardPage.createProjectFromMenu();

	await page.getByRole("tab", { name: "Connections" }).click();

	await page.getByRole("button", { name: "Add new" }).click();

	const nameInput = page.getByRole("textbox", { exact: true, name: "Name" });
	await nameInput.click();
	await nameInput.fill("NewDiscord");

	await page.getByTestId("select-connection-type").click();
	await page.getByRole("option", { name: "Discord" }).click();
	const nameBotToken = page.getByRole("textbox", { exact: true, name: "Bot Token" });
	await nameBotToken.click();
	await nameBotToken.fill("NewBotToken");
	await page.getByRole("button", { name: "Save Connection" }).click();
});

test.describe("Project Connection Discord", () => {
	test("Create Discord", async ({ page }) => {
		const newNameInTable = page.getByRole("row", { name: "NewDiscord" });
		const newAppInTable = page.getByRole("row", { name: "Discord" });
		await expect(newNameInTable).toHaveCount(1);
		await expect(newAppInTable).toHaveCount(1);
	});

	test("Delete Discord", async ({ page }) => {
		const newNameInTable = page.getByRole("row", { name: "NewDiscord" });
		const newAppInTable = page.getByRole("row", { name: "Discord" });
		await expect(newNameInTable).toHaveCount(1);
		await expect(newAppInTable).toHaveCount(1);

		await page.getByRole("button", { name: "Remove connection" }).click();
		await page.getByRole("button", { name: "Yes, delete" }).click();
		const newVariableInTable = page.getByRole("cell", { name: "NewDiscord" });
		await expect(newVariableInTable).not.toBeVisible();
	});
});
