import { test, expect } from "@playwright/test";

test.describe("Project Suite", () => {
	// Move common setup actions to beforeEach
	test.beforeEach(async ({ page }) => {
		await page.goto(""); // Assuming this navigates to the root of your project management app
		await page.getByRole("button", { name: "New Project" }).click(); // Create a new project

		// Optional: Wait for a specific element that confirms project creation, if necessary.
		// This could be waiting for a URL change or a specific element to be visible.
	});

	test("Change project name", async ({ page }) => {
		await page.getByRole("textbox", { name: "Rename" }).click();
		await page.getByRole("textbox", { name: "Rename" }).fill("Grankie_0121");
		await expect(page.getByText("Grankie_0121")).toBeVisible(); // Properly wait and assert visibility
	});

	test("Add new file to project", async ({ page }) => {
		// Extract project ID from URL, assuming project creation redirects to a new URL
		const projectURL = page.url();
		const projectId = projectURL.split("/").pop();
		expect(projectId).toBeTruthy(); // Assert projectId is not null or empty

		await expect(page.getByText(projectId!)).toBeVisible(); // Wait and check if projectId is visible

		const addNewCodeButton = page.getByRole("button", { name: "Add new code file" });
		await addNewCodeButton.click(); // Implicitly waits for visibility
		await page.waitForTimeout(500); // Consider replacing with more deterministic wait conditions

		const newFileInput = page.getByRole("textbox", { name: "new file name" });
		await expect(newFileInput).toBeVisible(); // Proper assertion for visibility
	});
});
