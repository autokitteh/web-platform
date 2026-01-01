import { expect, test } from "../../fixtures";
import { ProjectPage } from "../../pages/project";
import { returnToTriggersList, startTriggerCreation } from "../../utils";
import { randomName } from "../../utils/randomName";
import { waitForToastToBeRemoved } from "../../utils/waitForToast";

async function createProjectConnection(
	page: import("@playwright/test").Page,
	connectionsConfig: import("../../pages/connectionsConfig").ConnectionsConfig,
	connectionName: string
) {
	const addButton = page.getByRole("button", { name: "Add Connections" });
	await addButton.waitFor({ state: "visible", timeout: 5000 });
	await expect(addButton).toBeEnabled({ timeout: 2500 });
	await addButton.click();

	await expect(page.getByText("Add new connection")).toBeVisible();

	await connectionsConfig.fillConnectionName(connectionName);
	await connectionsConfig.selectIntegration("Twilio");
	await connectionsConfig.selectConnectionType("Auth Token");

	await page.getByRole("textbox", { name: "Account SID" }).fill("AC1234567890");
	await page.getByRole("textbox", { name: "Auth Token" }).fill("1234567890");

	await connectionsConfig.clickSaveConnection();

	await page.waitForURL(/\/projects\/[^/]+\/explorer\/settings\/connections\/.+\/edit/);
	await waitForToastToBeRemoved(page, "Connection created successfully");

	await page.getByRole("button", { name: "Close Edit connection", exact: true }).click();
	await page.waitForURL(/\/projects\/[^/]+\/explorer\/settings/);

	await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();
}

test.describe("Trigger with Project Connection Suite", () => {
	let connectionName: string;
	let triggerName: string;
	let projectId: string;
	let projectName: string;

	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const { DashboardPage } = await import("../../pages/dashboard");
		const dashboardPage = new DashboardPage(page);

		projectName = await dashboardPage.createProjectFromMenu();
		projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";

		await context.close();
	});

	test.beforeEach(async () => {
		const randomSuffix = randomName();
		connectionName = `conn_${randomSuffix}`;
		triggerName = `trig_${randomSuffix}`;
	});

	test.afterAll(async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		await page.goto(`/projects/${projectId}`);
		await page.waitForLoadState("networkidle");
		const projectPage = new ProjectPage(page);
		const deploymentExists = await page
			.locator('button[aria-label="Sessions"]')
			.isEnabled()
			.catch(() => false);
		await projectPage.deleteProject(projectName, !!deploymentExists);
		await context.close();
	});

	test("Create trigger with project connection and verify data in edit mode", async ({ connectionsConfig, page }) => {
		await page.goto(`/projects/${projectId}/explorer/settings`);
		await page.waitForLoadState("networkidle");

		await createProjectConnection(page, connectionsConfig, connectionName);

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

	test("Create trigger with project connection and verify trigger info button exists", async ({
		connectionsConfig,
		page,
	}) => {
		await page.goto(`/projects/${projectId}/explorer/settings`);
		await page.waitForLoadState("networkidle");

		await createProjectConnection(page, connectionsConfig, connectionName);

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

	test("Edit trigger with project connection and verify connection is disabled", async ({
		connectionsConfig,
		page,
	}) => {
		await page.goto(`/projects/${projectId}/explorer/settings`);
		await page.waitForLoadState("networkidle");

		await createProjectConnection(page, connectionsConfig, connectionName);

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

	test("Project connection trigger preserves all fields after save and edit", async ({ connectionsConfig, page }) => {
		await page.goto(`/projects/${projectId}/explorer/settings`);
		await page.waitForLoadState("networkidle");

		await createProjectConnection(page, connectionsConfig, connectionName);

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

		await triggersHeader.click();
		await page.waitForTimeout(500);

		await expect(page.getByText(triggerName)).toBeVisible();

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
