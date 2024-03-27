import { test, expect } from "@playwright/test";

test.describe("Project Suite", () => {
	test("Create project", async ({ page }) => {
		await page.goto("");

		const button = page.getByRole("button", { name: "New Project" });
		await button.hover();
		await button.click();
		await page.waitForURL(/http:\/\/localhost:4173\/(prj_[a-zA-Z0-9]+)/);

		const projectURL = page.url();
		const projectId = projectURL.split("/").pop();

		if (!projectId) {
			throw new Error("Project ID not found after creation.");
		}

		await expect(page.getByText(projectId)).toBeVisible();
	});

	test("Change project name", async ({ page }) => {
		await page.goto("");

		const button = page.getByRole("button", { name: "New Project" });
		await button.hover();
		await button.click();
		await page.waitForURL(/http:\/\/localhost:4173\/(prj_[a-zA-Z0-9]+)/);

		const projectURL = page.url();
		const projectId = projectURL.split("/").pop();

		if (!projectId) {
			throw new Error("Project ID not found after creation.");
		}

		await expect(page.getByText(projectId)).toBeVisible();

		const renameTextbox = page.getByRole("textbox", { name: "Rename" });
		await renameTextbox.click();
		await renameTextbox.fill("Grankie_0121");
		await expect(page.getByText("Grankie_0121")).toBeVisible();
	});

	test("Add new file to project", async ({ page }) => {
		await page.goto("");

		const button = page.getByRole("button", { name: "New Project" });
		await button.hover();
		await button.click();
		await page.waitForURL(/http:\/\/localhost:4173\/(prj_[a-zA-Z0-9]+)/);

		const projectURL = page.url();
		const projectId = projectURL.split("/").pop();

		if (!projectId) {
			throw new Error("Project ID not found after creation.");
		}

		await expect(page.getByText(projectId)).toBeVisible();

		const addNewCodeButton = page.getByRole("button", { name: "Add new code file" });
		await addNewCodeButton.click();
		await page.waitForTimeout(500);

		const newFileInput = page.getByRole("textbox", { name: "new file name" });
		await expect(newFileInput).toBeVisible();
	});
});
