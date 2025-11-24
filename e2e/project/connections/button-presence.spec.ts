/* eslint-disable unicorn/filename-case */
/* eslint-disable no-console */
import { test } from "../../fixtures";
import testCases from "../../fixtures/connection-test-cases.json" assert { type: "json" };
import { ConnectionFormPage } from "../../pages/ConnectionFormPage";

test.describe("Connection Form Button Presence - Generated", () => {
	test.beforeAll(() => {
		const stats = {
			total: testCases.length,
			singleType: testCases.filter((tc) => tc.category === "single-type").length,
			multiType: testCases.filter((tc) => tc.category === "multi-type").length,
		};

		console.log("\n📊 Test Coverage Statistics:");
		console.log(`   Total test cases: ${stats.total}`);
		console.log(`   Single-type: ${stats.singleType}`);
		console.log(`   Multi-type: ${stats.multiType}\n`);
	});

	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();

		await page.getByRole("tab", { name: "connections" }).click();

		await page.getByRole("button", { name: "Add new" }).click();
	});

	for (const testCase of testCases) {
		test(`${testCase.testName} should show action button`, async ({ page }) => {
			const formPage = new ConnectionFormPage(page);

			await formPage.fillConnectionName(`Test ${testCase.testName}`);

			await formPage.selectIntegration(testCase.label);

			if (testCase.category === "multi-type" && testCase.authLabel) {
				await formPage.selectConnectionType(testCase.authLabel);
			}

			await formPage.expectAnySubmitButton();
		});
	}
});
