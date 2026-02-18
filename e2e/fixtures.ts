/* eslint-disable react-hooks/rules-of-hooks */
import { expect, test as base, type Page } from "@playwright/test";

import { OrgConnectionsPage, ConnectionsConfig, DashboardPage, ProjectPage } from "./pages";

// eslint-disable-next-line @typescript-eslint/naming-convention
const RATE_LIMIT_DELAY = process.env.E2E_RATE_LIMIT_DELAY ? parseInt(process.env.E2E_RATE_LIMIT_DELAY, 10) : 0;

// eslint-disable-next-line @typescript-eslint/naming-convention
const BACKEND_BASE_PORT = 9980;

type PageFixtureArgs = { page: Page };
type UseFixture<T> = (fixture: T) => Promise<void>;

const test = base.extend<
	{
		connectionsConfig: ConnectionsConfig;
		dashboardPage: DashboardPage;
		orgConnectionsPage: OrgConnectionsPage;
		projectPage: ProjectPage;
	},
	{ workerBackendPort: number }
>({
	workerBackendPort: [
		// eslint-disable-next-line no-empty-pattern
		async ({}, use, workerInfo) => {
			const port = BACKEND_BASE_PORT + workerInfo.workerIndex;
			await use(port);
		},
		{ scope: "worker" },
	],

	page: async ({ page, workerBackendPort }, use) => {
		if (workerBackendPort !== BACKEND_BASE_PORT) {
			await page.route(`http://localhost:${BACKEND_BASE_PORT}/**`, async (route) => {
				const originalUrl = route.request().url();
				const newUrl = originalUrl.replace(
					`http://localhost:${BACKEND_BASE_PORT}`,
					`http://localhost:${workerBackendPort}`
				);
				const response = await route.fetch({ url: newUrl });
				await route.fulfill({ response });
			});
		}
		await use(page);
	},

	connectionsConfig: async ({ page }: PageFixtureArgs, use: UseFixture<ConnectionsConfig>) => {
		await use(new ConnectionsConfig(page));
	},
	dashboardPage: async ({ page }: PageFixtureArgs, use: UseFixture<DashboardPage>) => {
		await use(new DashboardPage(page));
	},
	orgConnectionsPage: async ({ page }: PageFixtureArgs, use: UseFixture<OrgConnectionsPage>) => {
		await use(new OrgConnectionsPage(page));
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
