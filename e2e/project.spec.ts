import { EProjectTabs } from "@enums/components";
import { test, expect } from "@playwright/test";

test.describe("Project Suite", () => {
	// test.beforeEach(async ({ page }) => {
	// 	await page.goto("");
	// 	const button = page.getByRole("button", { name: "New Project" });
	// 	await button.hover();
	// 	if (await button.isVisible()) {
	// 		await button.click();
	// 	} else {
	// 		test.fail();
	// 	}
	// 	const projectURL = await page.url();
	// 	const projectId = projectURL.split("/").pop();
	// 	if (!projectId) {
	// 		test.fail();
	// 	}
	// 	await expect(page.getByText(projectId!)).toBeVisible();
	// });

	// test("Change project name", async ({ page }) => {
	// 	await page.getByRole("textbox", { name: "Rename" }).click();
	// 	await page.getByRole("textbox", { name: "Rename" }).fill("Grankie_0121");
	// 	expect(page.getByText("Grankie_0121")).toBeTruthy();
	// });

	// test("Create new file to project", async ({ page }) => {
	// 	const createNewFileButton = page.getByRole("button", { name: "Create new file" });
	// 	if (await createNewFileButton.isVisible()) {
	// 		await createNewFileButton.click();
	// 		await page.waitForTimeout(500);
	// 	} else {
	// 		test.fail();
	// 	}
	// 	const newFileInput = page.getByRole("textbox", { name: "new file name" });
	// 	await newFileInput.isVisible();
	// });

	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		const button = page.getByRole("button", { name: "New Project" });
		await button.hover();
		if (await button.isVisible()) {
			await button.click();
		} else {
			test.fail();
		}
		await page.getByRole("tab", { name: EProjectTabs.variables }).click();
		await page.getByRole("link", { name: "Add new" }).click();

		await page.getByPlaceholder("Name").click();
		await page.getByPlaceholder("Name").fill("nameVariable");
		await page.getByPlaceholder("Value").click();
		await page.getByPlaceholder("Value").fill("valueVariable");

		await Promise.all([page.waitForURL(page.url()), page.getByRole("button", { name: "Save" }).click()]);
	});

	test("Create variable", async ({ page }) => {
		const isVariableCreated = page.getByText("nameVariable");
		expect(isVariableCreated).toBeTruthy();
	});

	test("Modify variable", async ({ page }) => {
		await page.getByRole("button", { name: "Modify nameVariable variable" }).click();
		await page.getByPlaceholder("Value").click();
		await page.getByPlaceholder("Value").fill("newValueVariable");
		await page.getByRole("button", { name: "Save" }).click();
		expect(page.getByText("newValueVariable")).toBeTruthy();
	});

	test("Delete variable", async ({ page }) => {
		const removeVariableButton = page.getByRole("button", { name: "Delete nameVariable variable" });
		await removeVariableButton.click();
		await page.waitForTimeout(500);
		await page.getByRole("button", { name: "Yes, delete" }).click();
		expect(await removeVariableButton.isHidden());
	});

	test.afterEach(async ({ page }) => {
		await page.goto("/");
	});
});
