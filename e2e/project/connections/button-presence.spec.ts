/* eslint-disable unicorn/filename-case */
import { discoverAllIntegrations, getIntegrationStats } from "./utils/auto-discover-integrations";
import { test } from "e2e/fixtures";
import { ConnectionFormPage } from "e2e/pages/ConnectionFormPage";

test.describe("Connection Form Button Presence - Auto-Discovered", () => {
	const allTestCases = discoverAllIntegrations();

	test.beforeAll(() => {
		const stats = getIntegrationStats();
		// eslint-disable-next-line no-console
		console.log("\n📊 Test Coverage Statistics:");
		// eslint-disable-next-line no-console
		console.log(`   Total integrations: ${stats.integrations}`);
		// eslint-disable-next-line no-console
		console.log(`   Total test scenarios: ${stats.total}`);
		// eslint-disable-next-line no-console
		console.log(`   Single-type: ${stats.singleType}`);
		// eslint-disable-next-line no-console
		console.log(`   Multi-type: ${stats.multiType}\n`);
	});

	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();

		await page.getByRole("tab", { name: "connections" }).click();

		await page.getByRole("button", { name: "Add new" }).click();
	});

	for (const testCase of allTestCases) {
		test(`${testCase.testName} should show action button`, async ({ page }) => {
			const formPage = new ConnectionFormPage(page);

			await formPage.fillConnectionName(`Test ${testCase.testName}`);

			await formPage.selectIntegration(testCase.integrationLabel);

			if (testCase.category === "multi-type" && testCase.connectionTypeLabel) {
				await formPage.selectConnectionType(testCase.connectionTypeLabel);
			}

			await formPage.expectAnySubmitButton();
		});
	}
});
