import { expect, type Page } from "@playwright/test";

export async function startTriggerCreation(
	page: Page,
	name: string,
	triggerType: string,
	options?: { isDeployed?: boolean }
) {
	const addTriggersButton = page.locator('button[aria-label="Add Triggers"]');
	await addTriggersButton.hover();
	await addTriggersButton.click();

	if (options?.isDeployed) {
		await expect(page.getByText("Changes might affect the currently running deployments.")).toBeVisible();

		const okButton = await page.getByRole("button", { name: "Ok", exact: true });
		await okButton.click();
	}

	const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
	await nameInput.click();
	await nameInput.fill(name);

	await page.getByTestId("select-trigger-type-empty").click();
	await page.getByRole("option", { name: triggerType }).click();
}

export async function selectFile(page: Page, fileName: string) {
	await page.getByTestId("select-file-empty").click();
	await page.getByRole("option", { name: fileName }).click();
}

export async function createCustomEntryFunction(page: Page, functionName: string) {
	const input = page.getByRole("combobox", { name: "Function name" });
	await input.fill(functionName);
	await input.press("Enter");
}

export async function returnToTriggersList(page: Page) {
	try {
		await page.getByRole("button", { name: "Return back" }).click();
	} catch {
		await page.getByRole("button", { name: "Close Modify trigger" }).click();
	}
}
