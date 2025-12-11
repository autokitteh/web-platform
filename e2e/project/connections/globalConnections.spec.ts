import randomatic from "randomatic";

import { testConnectionName, testIntegrationName } from "../../constants/globalConnections.constants";
import { expect, test } from "../../fixtures";

const getRandomConnectionName = (name?: string) => `${name}Connection${randomatic("0a", 6)}`;

test.describe("Global Connections Suite", () => {
	test("Navigate to global connections page", async ({ globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();

		await expect(page.getByRole("heading", { name: /Global Connections \(\d+\)/ })).toBeVisible();
		await expect(page.getByRole("button", { name: "Add Connection" })).toBeVisible();
	});

	test("Create connection with empty name shows validation error", async ({
		connectionsConfig,
		globalConnectionsPage,
		page,
	}) => {
		await globalConnectionsPage.goto();
		await globalConnectionsPage.clickAddConnection();
		await connectionsConfig.selectIntegration(testIntegrationName);
		await globalConnectionsPage.fillTwilioAccountSidAndAuthToken();
		await page.getByRole("button", { name: "Save Connection" }).click();

		const nameError = page.getByText("Name is required");
		await expect(nameError).toBeVisible();
	});

	test("View connection details in edit view", async ({ connectionsConfig, globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();
		const connectionName = getRandomConnectionName(testConnectionName);
		await globalConnectionsPage.createTwilioConnection(connectionName);

		const twilioConnectionRow = await connectionsConfig.getConnectionRow(connectionName);

		await expect(twilioConnectionRow).toBeVisible();
		await twilioConnectionRow.click();

		const connectionNameInput = page.getByLabel("Name", { exact: true });

		await expect(connectionNameInput).toBeVisible();
		await expect(connectionNameInput).toHaveValue(connectionName);

		const integrationSelect = page.getByTestId("select-integration-twilio-selected");
		await expect(integrationSelect).toBeVisible();
		await expect(integrationSelect.getByText(testIntegrationName)).toBeVisible();

		const integrationInput = integrationSelect.locator('input[role="combobox"]');
		await expect(integrationInput).toBeDisabled();
	});

	test("Delete connection", async ({ connectionsConfig, globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();

		const randomName = getRandomConnectionName(testConnectionName);
		await globalConnectionsPage.createTwilioConnection(randomName);
		await connectionsConfig.closeConnectionCreatedSuccessfullyToast();
		await connectionsConfig.clickDeleteButton(randomName);

		await expect(page.getByText("Delete Connection")).toBeVisible();
		await expect(page.getByText(`Are you sure you want to delete ${randomName}?`)).toBeVisible();

		await connectionsConfig.confirmDelete();

		await connectionsConfig.closeConnectionRemovedSuccessfullyToast(randomName);

		const deletedConnection = await connectionsConfig.getConnectionCell(randomName);
		await expect(deletedConnection).toBeNull();
		const errorToast = page.locator('[role="alert"]', {
			hasText: "Error while fetching connection, connection ID",
		});

		await expect(errorToast).toHaveCount(0);
	});

	test("Close connection editor", async ({ connectionsConfig, globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();

		const randomName = getRandomConnectionName(testConnectionName);
		await globalConnectionsPage.createTwilioConnection(randomName);

		await connectionsConfig.clickConnectionRow(randomName);
		await expect(page).toHaveURL(/\/connections\/.+/);
		await page.getByRole("button", { name: "Close Edit connection", exact: true }).click();
		await expect(page).toHaveURL("/connections");
	});

	test("Connection shows correct status", async ({ connectionsConfig, globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();

		const randomName = getRandomConnectionName(testConnectionName);
		await globalConnectionsPage.createTwilioConnection(randomName);
		await page.reload();

		const row = await connectionsConfig.getConnectionRow(randomName);
		const rowStatus = row.getByRole("cell", { name: "ok", exact: true });
		await expect(rowStatus).toBeVisible();
	});

	test("Back button from add connection returns to list", async ({ globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();
		await globalConnectionsPage.clickAddConnection();

		await expect(page).toHaveURL("/connections/new");

		await page.getByRole("button", { name: "Close Add new connection" }).click();

		await expect(page).toHaveURL("/connections");
	});

	test("Back button from edit connection returns to list", async ({
		connectionsConfig,
		globalConnectionsPage,
		page,
	}) => {
		await globalConnectionsPage.goto();
		const randomName = getRandomConnectionName(testConnectionName);
		await globalConnectionsPage.createTwilioConnection(randomName);

		await connectionsConfig.clickConfigureButton(randomName);
		await expect(page).toHaveURL(/\/connections\/.*\/edit/);

		await page.getByRole("button", { name: "Close Edit connection", exact: true }).click();

		await expect(page).toHaveURL("/connections");
	});
});
