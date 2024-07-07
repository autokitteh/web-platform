import { DashboardPage } from "./pages/dashboard";

import { expect, test as base } from "@playwright/test";

const test = base.extend<{ dashboardPage: DashboardPage }>({
	dashboardPage: async ({ page }, use) => {
		await use(new DashboardPage(page));
	},
});
export { test, expect };
