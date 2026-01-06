import { expect, test } from "../../fixtures";
import { cleanupCurrentProject, returnToTriggersList, startTriggerCreation } from "../../utils";
import { randomName } from "../../utils/randomName";
import { waitForToastToBeRemoved } from "../../utils/waitForToast";

const triggerName = "orgConnTrigger";

test.describe("Trigger with Org Connection Suite", () => {
	let connectionName: string;

	test.beforeEach(async ({ orgConnectionsPage }) => {
		const randomSuffix = randomName();
		connectionName = `conn_${randomSuffix}`;
		await orgConnectionsPage.goto();
		await orgConnectionsPage.createTwilioConnection(connectionName);
	});

	test.afterEach(async ({ page, connectionsConfig }) => {
		await cleanupCurrentProject(page);

		await page.goto("/connections");
		const connectionCell = await connectionsConfig.getConnectionCell(connectionName);
		if (connectionCell) {
			await connectionsConfig.clickDeleteButton(connectionName);
			await connectionsConfig.confirmDelete();
			await connectionsConfig.closeConnectionRemovedSuccessfullyToast(connectionName);
		}
	});

	test("Create trigger with org-connection and verify data in edit mode", async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();

		const triggersHeader = page.getByText("Triggers").first();
		await triggersHeader.click();

		await startTriggerCreation(page, triggerName, connectionName);

		await page.locator('button[aria-label="Save"]').click();
		await waitForToastToBeRemoved(page, "Trigger created successfully");

		await returnToTriggersList(page);

		await expect(page.getByText(triggerName)).toBeVisible();

		const editButton = page.locator(`button[aria-label="Edit ${triggerName}"]`);
		await editButton.click();

		const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
		await expect(nameInput).toBeVisible();
		await expect(nameInput).toHaveValue(triggerName);
		await expect(nameInput).toBeDisabled();

		const triggerTypeSelect = page.locator('[data-testid^="select-trigger-type-"][data-testid$="-selected"]');
		await expect(triggerTypeSelect).toBeVisible();

		const selectedValue = triggerTypeSelect.locator(".react-select__single-value");
		await expect(selectedValue).toContainText(connectionName);
	});

	test("Create trigger with org-connection and verify trigger info button exists", async ({
		dashboardPage,
		page,
	}) => {
		await dashboardPage.createProjectFromMenu();

		const triggersHeader = page.getByText("Triggers").first();
		await triggersHeader.click();

		await startTriggerCreation(page, triggerName, connectionName);

		await page.locator('button[aria-label="Save"]').click();
		await waitForToastToBeRemoved(page, "Trigger created successfully");

		await returnToTriggersList(page);

		await expect(page.getByText(triggerName)).toBeVisible();

		const infoButton = page.locator(`button[aria-label='Trigger information for "${triggerName}"']`);
		await expect(infoButton).toBeVisible();
	});

	test("Edit trigger with org-connection and modify event type", async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();

		const triggersHeader = page.getByText("Triggers").first();
		await triggersHeader.click();

		await startTriggerCreation(page, triggerName, connectionName);

		const eventTypeSelect = page.locator('[data-testid^="select-event-type"]').first();
		if (await eventTypeSelect.isVisible()) {
			await eventTypeSelect.click();
			const firstEventOption = page.getByRole("option").first();
			if (await firstEventOption.isVisible()) {
				await firstEventOption.click();
			}
		}

		await page.locator('button[aria-label="Save"]').click();
		await waitForToastToBeRemoved(page, "Trigger created successfully");

		await returnToTriggersList(page);

		const editButton = page.locator(`button[aria-label="Edit ${triggerName}"]`);
		await editButton.click();

		const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
		await expect(nameInput).toHaveValue(triggerName);
		await expect(nameInput).toBeDisabled();

		const triggerTypeSelect = page.locator('[data-testid^="select-trigger-type-"][data-testid$="-selected"]');
		await expect(triggerTypeSelect).toBeVisible();

		const selectedConnectionValue = triggerTypeSelect.locator(".react-select__single-value");
		await expect(selectedConnectionValue).toContainText(connectionName);

		const triggerTypeInput = triggerTypeSelect.locator('input[role="combobox"]');
		await expect(triggerTypeInput).toBeDisabled();
	});

	test("Org-connection trigger preserves all fields after save and edit", async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();

		const triggersHeader = page.getByText("Triggers").first();
		await triggersHeader.click();

		await startTriggerCreation(page, triggerName, connectionName);

		await page.getByTestId("select-file-empty").click();
		await page.getByRole("option", { name: "program.py" }).click();

		const entryFunctionInput = page.getByRole("combobox", { name: "Function name" });
		await entryFunctionInput.fill("on_event");
		await entryFunctionInput.press("Enter");

		await page.locator('button[aria-label="Save"]').click();
		await waitForToastToBeRemoved(page, "Trigger created successfully");

		await returnToTriggersList(page);

		const editButton = page.locator(`button[aria-label="Edit ${triggerName}"]`);
		await editButton.click();

		const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
		await expect(nameInput).toHaveValue(triggerName);

		const triggerTypeSelect = page.locator('[data-testid^="select-trigger-type-"][data-testid$="-selected"]');
		const selectedConnectionValue = triggerTypeSelect.locator(".react-select__single-value");
		await expect(selectedConnectionValue).toContainText(connectionName);

		const fileSelect = page.locator('[data-testid^="select-file-"][data-testid$="-selected"]');
		const selectedFileValue = fileSelect.locator(".react-select__single-value");
		await expect(selectedFileValue).toContainText("program.py");

		const entryFunctionSelect = page.locator('[data-testid^="select-entry-function-"][data-testid$="-selected"]');
		const selectedEntryFunctionValue = entryFunctionSelect.locator(".react-select__single-value");
		await expect(selectedEntryFunctionValue).toContainText("on_event");
	});
});
