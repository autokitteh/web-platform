import { DashboardPage } from "./pages/dashboard";
import { test as base, expect } from "@playwright/test";

const test = base.extend<{ dashboardPage: DashboardPage }>({
	dashboardPage: async ({ page }, use) => {
		await use(new DashboardPage(page));
	},
});
export { test, expect };
