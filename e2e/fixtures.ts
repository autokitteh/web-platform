/* eslint-disable react-hooks/rules-of-hooks */
import { expect, test as base } from "@playwright/test";

import { ConnectionPage, DashboardPage, ProjectPage } from "./pages";

const test = base.extend<{
	connectionPage: ConnectionPage;
	dashboardPage: DashboardPage;
	projectPage: ProjectPage;
}>({
	dashboardPage: async ({ page }, use) => {
		await use(new DashboardPage(page));
	},
	connectionPage: async ({ page }, use) => {
		await use(new ConnectionPage(page));
	},
	projectPage: async ({ page }, use) => {
		await use(new ProjectPage(page));
	},
});
export { expect, test };
