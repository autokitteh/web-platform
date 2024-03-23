import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
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

	const addNewCodeButton = page.getByRole("button", { name: "Add new code file" });

	if (await addNewCodeButton.isVisible()) {
		await addNewCodeButton.click();
		await page.waitForTimeout(500);
	} else {
		test.fail();
	}

	const newFileInput = page.getByRole("textbox", { name: "new file name" });
	await newFileInput.isVisible();
});
