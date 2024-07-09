import { expect, test as base } from "@playwright/test";

import { DashboardPage } from "./pages/dashboard";

const test = base.extend<{ dashboardPage: DashboardPage }>({
	dashboardPage: async ({ page }, use) => {
		await use(new DashboardPage(page));
	},
});
export { expect, test };
