/* eslint-disable react-hooks/rules-of-hooks */
import { expect, test as base } from "@playwright/test";

import { DashboardPage, ProjectPage } from "./pages";

const test = base.extend<{ dashboardPage: DashboardPage; projectPage: ProjectPage }>({
	dashboardPage: async ({ page }, use) => {
		await use(new DashboardPage(page));
	},
	projectPage: async ({ page }, use) => {
		await use(new ProjectPage(page));
	},
});
export { expect, test };
