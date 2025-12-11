/* eslint-disable no-console */
import { expect, test } from "../../fixtures";
import connectionTestCasesData from "../../fixtures/connectionsTestCases.json" assert { type: "json" };
import { ProjectPage } from "../../pages/project";

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

test.describe.skip("Connection Form Button Presence - Generated", () => {
	let projectId: string;
	let projectName: string;

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
		const { DashboardPage } = await import("../../pages/dashboard");
		const dashboardPage = new DashboardPage(page);
		projectName = await dashboardPage.createProjectFromMenu();
		projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";

		if (!projectId) {
			throw new Error("Failed to extract project ID from URL");
		}

		await context.close();
	});

	test.beforeEach(async ({ page }) => {
		await page.goto(`/projects/${projectId}/explorer/settings`);
		await page.waitForLoadState("networkidle");

		const addConnectionsButton = page.getByRole("button", { name: "Add Connections" });
		await expect(addConnectionsButton).toBeVisible();
		await addConnectionsButton.click();

		await page.waitForLoadState("networkidle");
		await page.waitForTimeout(500);
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

	for (const testCase of testCases) {
		test(`${testCase.testName} should show action button`, async ({ connectionsConfig, page }) => {
			await connectionsConfig.fillConnectionName(`Test ${testCase.testName}`);

			await connectionsConfig.selectIntegration(testCase.label);

			if (testCase.category === "multi-type" && testCase.authLabel) {
				await connectionsConfig.selectConnectionType(testCase.authLabel);
			}

			await connectionsConfig.expectAnySubmitButton();

			await page.waitForLoadState("networkidle");
			await page.waitForTimeout(300);

			await expect(page).toHaveScreenshot(`connection-forms/${testCase.testName}-save-button.png`, {
				fullPage: false,
				animations: "disabled",
				maxDiffPixelRatio: 0.05,
			});

			const backButton = page.getByRole("button", { name: "Close Add new connection" });

			await backButton.click();

			await page.waitForURL(/\/projects\/[^/]+\/explorer\/settings/);
			await page.getByRole("heading", { name: "Configuration" }).isVisible();
		});
	}
});
