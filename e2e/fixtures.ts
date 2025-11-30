/* eslint-disable react-hooks/rules-of-hooks */
import { expect, test as base } from "@playwright/test";

import { ConnectionFormPage, DashboardPage, GlobalConnectionsPage, ProjectPage } from "./pages";

// eslint-disable-next-line @typescript-eslint/naming-convention
const RATE_LIMIT_DELAY = process.env.E2E_RATE_LIMIT_DELAY ? parseInt(process.env.E2E_RATE_LIMIT_DELAY, 10) : 0;

const test = base.extend<{
	connectionFormPage: ConnectionFormPage;
	dashboardPage: DashboardPage;
	globalConnectionsPage: GlobalConnectionsPage;
	projectPage: ProjectPage;
}>({
	connectionFormPage: async ({ page }, use) => {
		await use(new ConnectionFormPage(page));
	},
	dashboardPage: async ({ page }, use) => {
		await use(new DashboardPage(page));
	},
	globalConnectionsPage: async ({ page }, use) => {
		await use(new GlobalConnectionsPage(page));
	},
	projectPage: async ({ page }, use) => {
		await use(new ProjectPage(page));
	},
});

if (RATE_LIMIT_DELAY > 0) {
	test.afterEach(async () => {
		await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
	});
}

export { expect, test };
