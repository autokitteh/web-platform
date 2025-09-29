/* eslint-disable react-hooks/rules-of-hooks */
import { expect, test as base, Page } from "@playwright/test";

import { ConnectionPage, DashboardPage, LoginPage, ProjectPage } from "./pages";
import { VisualTestHelpers } from "./utils/visual-helpers";

const test = base.extend<{
	connectionPage: ConnectionPage;
	dashboardPage: DashboardPage;
	loginPage: LoginPage;
	projectPage: ProjectPage;
	visualHelpers: typeof VisualTestHelpers;
}>({
	// Override the page fixture to disable auth for login tests
	page: async ({ page }, use, testInfo) => {
		// For login tests, clear auth headers to force login page
		// This ensures we're not logged in when we need to see the login page
		const isLoginRelatedTest =
			testInfo.title.toLowerCase().includes("login") ||
			testInfo.file.includes("login") ||
			testInfo.file.includes("auth/") ||
			testInfo.title.toLowerCase().includes("auth");

		if (isLoginRelatedTest) {
			await page.setExtraHTTPHeaders({});
		}
		await use(page);
	},
	connectionPage: async ({ page }: { page: Page }, use: (r: ConnectionPage) => Promise<void>) => {
		await use(new ConnectionPage(page));
	},
	dashboardPage: async ({ page }: { page: Page }, use: (r: DashboardPage) => Promise<void>) => {
		await use(new DashboardPage(page));
	},
	loginPage: async ({ page }: { page: Page }, use: (r: LoginPage) => Promise<void>) => {
		await use(new LoginPage(page));
	},
	projectPage: async ({ page }: { page: Page }, use: (r: ProjectPage) => Promise<void>) => {
		await use(new ProjectPage(page));
	},
	visualHelpers: async ({}, use: (r: typeof VisualTestHelpers) => Promise<void>) => {
		await use(VisualTestHelpers);
	},
});
export { expect, test };
