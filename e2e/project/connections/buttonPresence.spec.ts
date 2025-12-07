/* eslint-disable import/no-unresolved */
/* eslint-disable no-console */
import randomatic from "randomatic";

import { test } from "../../fixtures";
// @ts-expect-error - Generated file only exists during test runs
import connectionTestCasesData from "../../fixtures/connectionsTestCases.json" assert { type: "json" };

type ConnectionTestCategory = "single-type" | "multi-type";
interface ConnectionTestCase {
	authLabel?: string | null;
	authType?: string | null;
	category: ConnectionTestCategory;
	integration: string;
	label: string;
	testName: string;
}

const testCases = connectionTestCasesData as ConnectionTestCase[];

test.describe("Connection Form Button Presence - Generated", () => {
	let projectId: string;

	test.beforeAll(async ({ browser }) => {
		if (!testCases || testCases.length === 0) {
			throw new Error(
				"Connection test cases data is empty. Please run 'npm run generate:connection-test-data' to generate test data."
			);
		}

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

		await page.goto("/welcome");
		await page.getByRole("button", { name: "New Project From Scratch", exact: true }).click();
		const randomString = randomatic("Aa0", 8);
		const projectName = `connectionsButtonsTest${randomString}`;
		await page.getByPlaceholder("Enter project name").fill(projectName);
		await page.getByRole("button", { name: "Create" }).click();

		await page.waitForURL(/\/projects\/.+/);
		projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";

		await context.close();

		console.log(`✅ Created test project: ${projectName}\n`);
	});

	test.beforeEach(async ({ page }) => {
		await page.goto(`/projects/${projectId}/explorer/settings`);
		await page.getByRole("button", { name: "Add Connections" }).click();
	});

	for (const testCase of testCases) {
		test(`${testCase.testName} should show action button`, async ({ connectionsConfig, page }) => {
			await connectionsConfig.fillConnectionName(`Test ${testCase.testName}`);

			await connectionsConfig.selectIntegration(testCase.label);

			if (testCase.category === "multi-type" && testCase.authLabel) {
				await connectionsConfig.selectConnectionType(testCase.authLabel);
			}

			await connectionsConfig.expectAnySubmitButton();

			const backButton = page.getByRole("button", { name: "Close Add new connection" });

			await backButton.click();

			await page.waitForURL(/\/projects\/[^/]+\/explorer\/settings/);
			await page.getByRole("heading", { name: "Configuration" }).isVisible();
		});
	}
});
