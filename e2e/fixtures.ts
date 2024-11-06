/* eslint-disable react-hooks/rules-of-hooks */
import { expect, test as base } from "@playwright/test";

import { ConnectionPage, DashboardPage } from "./pages";

const test = base.extend<{ connectionPage: ConnectionPage; dashboardPage: DashboardPage }>({
	dashboardPage: async ({ page }, use) => {
		await use(new DashboardPage(page));
	},
	connectionPage: async ({ page }, use) => {
		await use(new ConnectionPage(page));
	},
});
export { expect, test };
