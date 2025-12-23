import randomatic from "randomatic";

import { expect, test } from "../fixtures";
import { waitForLoadingOverlayGone } from "../utils/waitForLoadingOverlayToDisappear";
import { waitForMonacoEditorToLoad } from "../utils/waitForMonacoEditor";
import { waitForToastToBeRemoved } from "../utils/waitForToast";

const varName = "nameVariable";

let projectId: string;

test.beforeAll(async ({ browser }) => {
	const context = await browser.newContext();
	const page = await context.newPage();

	await waitForLoadingOverlayGone(page);
	await page.goto("/");
	await page.locator('nav[aria-label="Main navigation"] button[aria-label="New Project"]').hover();
	await page.locator('nav[aria-label="Main navigation"] button[aria-label="New Project"]').click();
	await page.getByRole("button", { name: "New Project From Scratch" }).hover();
	await page.getByRole("button", { name: "New Project From Scratch" }).click();
	const projectName = randomatic("Aa", 8);
	await page.getByPlaceholder("Enter project name").fill(projectName);
	await page.getByRole("button", { name: "Create", exact: true }).click();
	await expect(page.locator('button[aria-label="Open program.py"]')).toBeVisible();
	await page.getByRole("button", { name: "Open program.py" }).click();

	await expect(page.getByRole("tab", { name: "program.py Close file tab" })).toBeVisible();

	await waitForMonacoEditorToLoad(page, 6000);

	await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible({ timeout: 1200 });

	projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";

	await page.goto(`/projects/${projectId}/explorer/settings`);
	await page.locator('button[aria-label="Add Variables"]').click();

	await page.getByLabel("Name", { exact: true }).click();
	await page.getByLabel("Name", { exact: true }).fill("nameVariable");
	await page.getByLabel("Value", { exact: true }).click();
	await page.getByLabel("Value").fill("valueVariable");
	await page.locator('button[aria-label="Save"]').click();

	await waitForToastToBeRemoved(page, "Variable created successfully");

	await context.close();
});

test.beforeEach(async ({ page }) => {
	await page.goto(`/projects/${projectId}/explorer/settings`);
});

test.describe("Project Variables Suite", () => {
	test("Create variable with empty fields", async ({ page }) => {
		await page.locator('button[aria-label="Add Variables"]').click();
		await page.locator('button[aria-label="Save"]').click();

		const nameErrorMessage = page.getByRole("alert", { name: "Name is required" });
		const valueErrorMessage = page.getByRole("alert", { name: "Value is required" });
		await expect(nameErrorMessage).toBeVisible();
		await expect(valueErrorMessage).toBeVisible();
	});

	test("Create variable with description", async ({ page }) => {
		await page.locator('button[aria-label="Add Variables"]').click();

		await page.getByLabel("Name", { exact: true }).click();
		await page.getByLabel("Name", { exact: true }).fill("testVariable");
		await page.getByLabel("Description").click();
		await page.getByLabel("Description").fill("This is a test variable description");
		await page.getByLabel("Value").click();
		await page.getByLabel("Value").fill("testValue");
		await page.getByRole("button", { name: "Save", exact: true }).click();

		await waitForToastToBeRemoved(page, "Variable created successfully");
	});

	test("Create variable without description", async ({ page }) => {
		await page.locator('button[aria-label="Add Variables"]').click();

		await page.getByLabel("Name", { exact: true }).click();
		await page.getByLabel("Name", { exact: true }).fill("testVariableNoDesc");
		await page.getByLabel("Value").click();
		await page.getByLabel("Value").fill("testValue");
		await page.getByRole("button", { name: "Save", exact: true }).click();

		await waitForToastToBeRemoved(page, "Variable created successfully");
	});

	test("Modify variable", async ({ page }) => {
		const configureButtons = page.locator('button[aria-label="Edit"]');
		await configureButtons.first().click();

		const valueInput = page.getByLabel("Value", { exact: true });

		await valueInput.fill("newValueVariable");
		const value = await valueInput.inputValue();
		expect(value).toEqual("newValueVariable");

		await page.locator('button[aria-label="Save"]').click();
		await page.waitForURL(/\/projects\/[^/]+\/explorer\/settings/);
		await page.locator("button[aria-label='Variable information for \"nameVariable\"']").hover();

		await expect(page.getByText("newValueVariable")).toBeVisible();
	});

	test("Modify variable description", async ({ page }) => {
		const configureButtons = page.locator('button[aria-label="Edit"]');
		await configureButtons.first().click();

		await page.getByLabel("Description").click();
		await page.getByLabel("Description").fill("Updated description text");
		await page.locator('button[aria-label="Save"]').click();

		await waitForToastToBeRemoved(page, "Variable edited successfully");
		await page.locator("button[aria-label='Variable information for \"nameVariable\"']").hover();
		await expect(page.getByText("Updated description text")).toBeVisible();
	});

	test("Modify variable with active deployment", async ({ page }) => {
		const deployButton = page.locator('button[aria-label="Deploy project"]');
		await deployButton.click();

		await waitForToastToBeRemoved(page, "Project successfully deployed with 1 warning");

		const configureButton = page.locator('button[id="nameVariable-variable-configure-button"]');
		await configureButton.click();

		const okButton = page.locator('button[aria-label="Ok"]');
		if (await okButton.isVisible()) {
			await okButton.click();
		}

		await page.getByLabel("Value", { exact: true }).click();
		await page.getByLabel("Value").fill("newValueVariable");
		await page.locator('button[aria-label="Save"]').click();
		await page.waitForURL(/\/projects\/[^/]+\/explorer\/settings/);
		await page.locator('button[aria-label="Config"]').click();

		await page.locator("button[aria-label='Variable information for \"nameVariable\"']").hover();
		await expect(page.getByText("newValueVariable")).toBeVisible();
	});

	test("Modifying variable with empty value", async ({ page }) => {
		const configureButton = page.locator('button[id="nameVariable-variable-configure-button"]');
		await configureButton.click();

		const okButton = page.locator('button[aria-label="Ok"]');
		if (await okButton.isVisible()) {
			await okButton.click();
		}

		const valueInput = page.getByLabel("Value", { exact: true });
		await valueInput.waitFor({ state: "visible", timeout: 5000 });
		await valueInput.clear();
		await page.locator('button[aria-label="Save"]').click();

		const valueErrorMessage = page.locator("text=/.*value.*required.*/i");
		await expect(valueErrorMessage).toBeVisible();

		await page.keyboard.press("Escape");
		await page.waitForTimeout(500);
	});

	test("Delete variable", async ({ page }) => {
		const deleteButton = page.locator('button[aria-label="Delete nameVariable"]');
		await deleteButton.click();

		const okButton = page.locator('button[aria-label="Ok"]');
		if (await okButton.isVisible()) {
			await okButton.click();
		}

		const confirmButton = page.locator('button[aria-label="Confirm and delete nameVariable"]');
		await confirmButton.waitFor({ state: "visible", timeout: 5000 });
		await confirmButton.click();
		await waitForToastToBeRemoved(page, "Variable removed successfully");
		await expect(page.getByText(varName, { exact: true })).not.toBeVisible();
	});
});
