import { testIntegrationName } from "../../constants";
import { expect, test } from "../../fixtures";
import { randomName } from "../../utils/randomName";

test.describe("Org Connections Suite", () => {
	let connectionName: string;
	test.beforeEach(async () => {
		const randomSuffix = randomName();
		connectionName = `conn_${randomSuffix}`;
	});

	test("Navigate to org connections page", async ({ orgConnectionsPage, page }) => {
		await orgConnectionsPage.goto();

		await expect(page.getByRole("heading", { name: /^Org Connections$|^Org Connections \(\d+\)$/ })).toBeVisible();
		await expect(page.getByRole("button", { name: "Add Connection" })).toBeVisible();
	});

	test("Create connection with empty name shows validation error", async ({
		connectionsConfig,
		orgConnectionsPage,
		page,
	}) => {
		await orgConnectionsPage.goto();
		await orgConnectionsPage.clickAddConnection();
		await connectionsConfig.selectIntegration(testIntegrationName);
		await orgConnectionsPage.fillTwilioAccountSidAndApiTokenAndApiSecret();
		await page.getByRole("button", { name: "Save Connection" }).click();

		const nameError = page.getByText("Name is required");
		await expect(nameError).toBeVisible();
	});

	test("View connection details in edit view", async ({ connectionsConfig, orgConnectionsPage, page }) => {
		await orgConnectionsPage.goto();
		await orgConnectionsPage.createTwilioConnection(connectionName);

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

	test("Delete connection", async ({ connectionsConfig, orgConnectionsPage, page }) => {
		await orgConnectionsPage.goto();

		await orgConnectionsPage.createTwilioConnection(connectionName);
		await connectionsConfig.clickDeleteButton(connectionName);

		await expect(page.getByText("Delete Connection")).toBeVisible();
		await expect(page.getByText(`Are you sure you want to delete ${connectionName}?`)).toBeVisible();

		await connectionsConfig.confirmDelete();

		await connectionsConfig.closeConnectionRemovedSuccessfullyToast(connectionName);

		const deletedConnection = await connectionsConfig.getConnectionCell(connectionName);
		await expect(deletedConnection).toBeNull();
		const errorToast = page.locator('[role="alert"]', {
			hasText: "Error while fetching connection, connection ID",
		});

		await expect(errorToast).toHaveCount(0);
	});

	test("Close connection editor", async ({ connectionsConfig, orgConnectionsPage, page }) => {
		await orgConnectionsPage.goto();

		await orgConnectionsPage.createTwilioConnection(connectionName);

		await connectionsConfig.clickConnectionRow(connectionName);
		await expect(page).toHaveURL(/\/connections\/.+/);
		await page.getByRole("button", { name: "Close Edit connection", exact: true }).click();
		await expect(page).toHaveURL("/connections");
	});

	test("Connection shows correct status", async ({ connectionsConfig, orgConnectionsPage, page }) => {
		await orgConnectionsPage.goto();

		await orgConnectionsPage.createTwilioConnection(connectionName);
		await page.reload();

		const row = await connectionsConfig.getConnectionRow(connectionName);
		const rowStatus = row.getByRole("cell", { name: "ok", exact: true });
		await expect(rowStatus).toBeVisible();
	});

	test("Back button from add connection returns to list", async ({ orgConnectionsPage, page }) => {
		await orgConnectionsPage.goto();
		await orgConnectionsPage.clickAddConnection();

		await expect(page).toHaveURL("/connections/new");

		await page.getByRole("button", { name: "Close Add new connection" }).click();

		await expect(page).toHaveURL("/connections");
	});

	test("Back button from edit connection returns to list", async ({
		connectionsConfig,
		orgConnectionsPage,
		page,
	}) => {
		await orgConnectionsPage.goto();
		await orgConnectionsPage.createTwilioConnection(connectionName);

		await connectionsConfig.clickConfigureButton(connectionName);
		await expect(page).toHaveURL(/\/connections\/.*\/edit/);

		await page.getByRole("button", { name: "Close Edit connection", exact: true }).click();

		await expect(page).toHaveURL("/connections");
	});
});
