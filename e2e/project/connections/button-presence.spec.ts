/* eslint-disable unicorn/filename-case */
/* eslint-disable no-console */
import { test } from "../../fixtures";
import testCases from "../../fixtures/connection-test-cases.json" assert { type: "json" };
import { ConnectionFormPage } from "../../pages/ConnectionFormPage";

test.describe("Connection Form Button Presence - Generated", () => {
	let projectId: string;

	test.beforeAll(async ({ browser }) => {
		const stats = {
			total: testCases.length,
			singleType: testCases.filter((tc) => tc.category === "single-type").length,
			multiType: testCases.filter((tc) => tc.category === "multi-type").length,
		};

		console.log("\n📊 Test Coverage Statistics:");
		console.log(`   Total test cases: ${stats.total}`);
		console.log(`   Single-type: ${stats.singleType}`);
		console.log(`   Multi-type: ${stats.multiType}\n`);

		const context = await browser.newContext();
		const page = await context.newPage();

		await page.goto("/");
		await page.getByRole("button", { name: "Create New Project" }).click();
		await page.getByPlaceholder("Enter project name").fill("Button Presence Test Project");
		await page.getByRole("button", { name: "Create" }).click();

		await page.waitForURL(/\/projects\/.+/);
		projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";

		await context.close();

		console.log(`✅ Created test project: ${projectId}\n`);
	});

	test.beforeEach(async ({ page }) => {
		await page.goto(`/projects/${projectId}/connections`);
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

			await page.getByRole("button", { name: "Cancel" }).click();
		});
	}
});
