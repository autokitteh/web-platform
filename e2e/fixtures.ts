/* eslint-disable react-hooks/rules-of-hooks */
import { expect, test as base, type Page } from "@playwright/test";

import { ConnectionFormPage, DashboardPage, GlobalConnectionsPage, ProjectPage } from "./pages";

// eslint-disable-next-line @typescript-eslint/naming-convention
const RATE_LIMIT_DELAY = process.env.E2E_RATE_LIMIT_DELAY ? parseInt(process.env.E2E_RATE_LIMIT_DELAY, 10) : 0;

type PageFixtureArgs = { page: Page };
type UseFixture<T> = (fixture: T) => Promise<void>;

const test = base.extend<{
	connectionFormPage: ConnectionFormPage;
	dashboardPage: DashboardPage;
	globalConnectionsPage: GlobalConnectionsPage;
	projectPage: ProjectPage;
}>({
	connectionFormPage: async ({ page }: PageFixtureArgs, use: UseFixture<ConnectionFormPage>) => {
		await use(new ConnectionFormPage(page));
	},
	dashboardPage: async ({ page }: PageFixtureArgs, use: UseFixture<DashboardPage>) => {
		await use(new DashboardPage(page));
	},
	globalConnectionsPage: async ({ page }: PageFixtureArgs, use: UseFixture<GlobalConnectionsPage>) => {
		await use(new GlobalConnectionsPage(page));
	},
	projectPage: async ({ page }: PageFixtureArgs, use: UseFixture<ProjectPage>) => {
		await use(new ProjectPage(page));
	},
});

if (RATE_LIMIT_DELAY > 0) {
	test.afterEach(async () => {
		await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
	});
}

export { expect, test };
