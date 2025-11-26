import randomatic from "randomatic";

import { expect, test } from "../fixtures";
import { waitForToast } from "../utils";
import { testConnectionName, testIntegrationName } from "./globalConnections.constants";

const getRandomConnectionName = (name?: string) => `${name}Connection${randomatic("0a", 6)}`;

test.describe("Global Connections Suite", () => {
	test("Navigate to global connections page", async ({ globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();

		await expect(page.getByText("Connections", { exact: true }).first()).toBeVisible();
		await expect(page.getByRole("button", { name: "Add Connection" })).toBeVisible();
	});

	test("Create connection with empty name shows validation error", async ({ globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();
		await globalConnectionsPage.clickAddConnection();
		await globalConnectionsPage.selectIntegration(testIntegrationName);
		await globalConnectionsPage.fillTwilioAccountSidAndAuthToken();
		await page.getByRole("button", { name: "Save Connection" }).click();

		const nameError = page.getByText("Name is required");
		await expect(nameError).toBeVisible();
	});

	test("View connection details in edit view", async ({ globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();
		const connectionName = getRandomConnectionName(testConnectionName);
		await globalConnectionsPage.createTwilioConnection(connectionName);
		await waitForToast(page, "Connection created successfully");

		const twilioConnectionRow = await globalConnectionsPage.getConnectionRow(connectionName);

		await expect(twilioConnectionRow).toBeVisible();
		await twilioConnectionRow.click();

		const connectionNameInput = page.getByLabel("Name", { exact: true });

		await expect(connectionNameInput).toBeVisible();
		await expect(connectionNameInput).toHaveValue(connectionName);

		const integrationOption = page.getByTitle(`Select icon label ${testIntegrationName}`);
		await expect(integrationOption).toBeVisible();

		const integrationSelect = page.locator('input[role="combobox"][aria-label="Select integration"]');
		await expect(integrationSelect).toHaveAttribute("disabled", "");
	});

	test("Delete connection", async ({ globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();

		const randomName = getRandomConnectionName(testConnectionName);
		await globalConnectionsPage.createTwilioConnection(randomName);
		await waitForToast(page, "Connection created successfully");

		await globalConnectionsPage.clickDeleteButton(randomName);

		await expect(page.getByText("Delete Connection")).toBeVisible();
		await expect(page.getByText(`Are you sure you want to delete ${randomName}?`)).toBeVisible();

		await globalConnectionsPage.confirmDelete();

		const deleteToast = await waitForToast(page, "Connection deleted successfully");

		const closeToastButton = page.getByRole("button", {
			name: 'Close "Success Connection deleted successfully" toast',
		});
		expect(closeToastButton).toBeVisible();
		await closeToastButton.click();
		await expect(deleteToast).not.toBeVisible();

		const deletedConnection = await globalConnectionsPage.getConnectionCell(randomName);
		await expect(deletedConnection).toBe(null);
	});

	test("Close connection editor", async ({ globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();

		const randomName = getRandomConnectionName(testConnectionName);
		await globalConnectionsPage.createTwilioConnection(randomName);
		await waitForToast(page, "Connection created successfully");

		await globalConnectionsPage.clickConnectionRow(randomName);
		await expect(page).toHaveURL(/\/connections\/.+/);
		await page.getByRole("button", { name: "Close Edit connection", exact: true }).click();
		await expect(page).toHaveURL("/connections");
	});

	test("Connection shows correct status", async ({ globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();

		const randomName = getRandomConnectionName(testConnectionName);
		await globalConnectionsPage.createTwilioConnection(randomName);
		await waitForToast(page, "Connection created successfully");
		await page.reload();

		const row = await globalConnectionsPage.getConnectionRow(randomName);
		const rowStatus = row.getByRole("cell", { name: "ok", exact: true });
		await expect(rowStatus).toBeVisible();
	});

	test("Back button from add connection returns to list", async ({ globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();
		await globalConnectionsPage.clickAddConnection();

		await expect(page).toHaveURL("/connections/new");

		await page.getByRole("button", { name: "Back" }).click();

		await expect(page).toHaveURL("/connections");
	});

	test("Back button from edit connection returns to list", async ({ globalConnectionsPage, page }) => {
		await globalConnectionsPage.goto();
		const randomName = getRandomConnectionName(testConnectionName);
		await globalConnectionsPage.createTwilioConnection(randomName);
		await waitForToast(page, "Connection created successfully");

		await globalConnectionsPage.clickConfigureButton(randomName);
		await expect(page).toHaveURL(/\/connections\/.*\/edit/);

		await page.getByRole("button", { name: "Close Edit connection", exact: true }).click();

		await expect(page).toHaveURL("/connections");
	});
});
