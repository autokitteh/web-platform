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

const fixedProjectName = "visual_test_connections";

test.describe("Connection Form Button Presence - Generated", () => {
	let projectId: string;

	test.beforeAll(async ({ browser }) => {
		if (!testCases || testCases.length === 0) {
			throw new Error(
				"Connection test cases data is empty. Please run 'npm run generate:connection-test-data' to generate test data."
			);
		}

		const context = await browser.newContext();
		const page = await context.newPage();

		const { DashboardPage } = await import("../../pages/dashboard");
		const dashboardPage = new DashboardPage(page);

		await page.goto("/?e2e=true");

		const existingProjectCell = page.getByRole("cell", { name: fixedProjectName });
		const existingProjectCount = await existingProjectCell.count();

		if (existingProjectCount > 0) {
			try {
				await existingProjectCell.scrollIntoViewIfNeeded();
				await existingProjectCell.click();
				await page.waitForURL(/\/projects\/[^/]+/);

				const projectTitleButton = page.getByRole("button", { name: "Edit project title" });
				const currentProjectName = await projectTitleButton.textContent();

				if (currentProjectName === fixedProjectName) {
					const projectPage = new ProjectPage(page);
					await projectPage.deleteProject(fixedProjectName, false);
				}
			} catch {
				await page.goto("/?e2e=true");
			}
		}

		await dashboardPage.createProjectFromMenu(fixedProjectName);
		projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";

		if (!projectId) {
			throw new Error("Failed to extract project ID from URL");
		}

		await context.close();
	});

	test.beforeEach(async ({ page }) => {
		await page.goto(`/projects/${projectId}/explorer/settings`);
		const addButton = page.getByRole("button", { name: "Add Connections" });

		await addButton.waitFor({ state: "visible", timeout: 1000 });
		await expect(addButton).toBeEnabled({ timeout: 1000 });
		await addButton.click();

		await expect(page.getByText("Add new connection")).toBeVisible();
		await expect(page.getByTestId("select-integration-empty")).toBeVisible();
	});

	test.afterAll(async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		try {
			await page.goto(`/projects/${projectId}/explorer`);
			await page.waitForLoadState("networkidle");

			const projectTitleButton = page.getByRole("button", { name: "Edit project title" });
			const isOnProjectPage = await projectTitleButton.isVisible({ timeout: 3000 }).catch(() => false);

			if (!isOnProjectPage) {
				await context.close();

				return;
			}

			const currentProjectName = await projectTitleButton.textContent();
			if (currentProjectName !== fixedProjectName) {
				await context.close();

				return;
			}

			const projectPage = new ProjectPage(page);
			await projectPage.deleteProject(fixedProjectName, false);
		} catch {
			// Cleanup failed - project may not exist or already deleted
		}

		await context.close();
	});

	for (const testCase of testCases) {
		test(`${testCase.testName} should show action button`, async ({ connectionsConfig, page }) => {
			test.setTimeout(250000);

			await connectionsConfig.fillConnectionName(`Test ${testCase.testName}`);

			await connectionsConfig.selectIntegration(testCase.label);

			if (testCase.category === "multi-type" && testCase.authLabel) {
				await connectionsConfig.selectConnectionType(testCase.authLabel);
			}

			await connectionsConfig.expectAnySubmitButton();

			await page.waitForLoadState("networkidle");
			await page.waitForTimeout(5800);

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
