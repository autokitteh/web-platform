/* eslint-disable no-console */
import randomatic from "randomatic";

import { expect, test } from "../../fixtures";
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

		try {
			await page.goto("/welcome");
			await page.waitForLoadState("networkidle");

			const newProjectButton = page.getByRole("button", { name: "New Project From Scratch", exact: true });
			await newProjectButton.waitFor({ state: "visible", timeout: 30000 });
			await newProjectButton.click();

			const randomString = randomatic("Aa0", 8);
			const projectName = `connectionsButtonsTest${randomString}`;

			const projectNameInput = page.getByPlaceholder("Enter project name");
			await projectNameInput.waitFor({ state: "visible", timeout: 10000 });
			await projectNameInput.fill(projectName);

			const createButton = page.getByRole("button", { name: "Create" });
			await createButton.waitFor({ state: "visible", timeout: 10000 });
			await createButton.click();

			await page.waitForURL(/\/projects\/.+/, { timeout: 30000 });
			await page.waitForLoadState("networkidle");
			projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";

			if (!projectId) {
				throw new Error("Failed to extract project ID from URL");
			}

			console.log(`✅ Created test project: ${projectName} (ID: ${projectId})\n`);
		} finally {
			await context.close();
		}
	});

	test.beforeEach(async ({ page }) => {
		if (!projectId) {
			throw new Error("Project ID not set - beforeAll may have failed");
		}
		await page.goto(`/projects/${projectId}/explorer/settings`);
		await page.waitForLoadState("networkidle");

		const addConnectionsButton = page.getByRole("button", { name: "Add Connections" });
		await addConnectionsButton.waitFor({ state: "visible", timeout: 15000 });
		await addConnectionsButton.click();
	});

	for (const testCase of testCases) {
		test(`${testCase.testName} should show action button`, async ({ connectionsConfig, page }) => {
			await connectionsConfig.fillConnectionName(`Test ${testCase.testName}`);

			await connectionsConfig.selectIntegration(testCase.label);

			if (testCase.category === "multi-type" && testCase.authLabel) {
				await connectionsConfig.selectConnectionType(testCase.authLabel);
			}

			await connectionsConfig.expectAnySubmitButton();

			await page.waitForLoadState("networkidle");

			await expect(page).toHaveScreenshot(`connection-forms/${testCase.testName}-save-button.png`, {
				fullPage: false,
				animations: "disabled",
			});

			const backButton = page.getByRole("button", { name: "Close Add new connection" });

			await backButton.click();

			await page.waitForURL(/\/projects\/[^/]+\/explorer\/settings/);
			await page.getByRole("heading", { name: "Configuration" }).isVisible();
		});
	}
});
