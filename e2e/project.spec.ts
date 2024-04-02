import { test, expect } from "@playwright/test";

test.describe("Project Suite", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("");
		const button = page.getByRole("button", { name: "New Project" });
		await button.hover();
		if (await button.isVisible()) {
			await button.click();
		} else {
			test.fail();
		}
		const projectURL = await page.url();
		const projectId = projectURL.split("/").pop();
		if (!projectId) {
			test.fail();
		}
		await expect(page.getByText(projectId!)).toBeVisible();
	});

	test("Change project name", async ({ page }) => {
		await page.getByRole("textbox", { name: "Rename" }).click();
		await page.getByRole("textbox", { name: "Rename" }).fill("Grankie_0121");
		expect(page.getByText("Grankie_0121")).toBeTruthy();
	});

	test("Create new file to project", async ({ page }) => {
		const createNewFileButton = page.getByRole("button", { name: "Create new file" });
		if (await createNewFileButton.isVisible()) {
			await createNewFileButton.click();
			await page.waitForTimeout(500);
		} else {
			test.fail();
		}
		const newFileInput = page.getByRole("textbox", { name: "new file name" });
		await newFileInput.isVisible();
	});
});
