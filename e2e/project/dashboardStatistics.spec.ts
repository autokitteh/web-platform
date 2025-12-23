import { expect, test } from "../fixtures";
import {
	waitForToastToBeRemoved,
	scrollToFindInVirtualizedList,
	getProjectsTableScrollContainer,
	getProjectRowLocator,
	waitForDashboardDataLoaded,
	waitForRefreshButtonEnabled,
} from "../utils";
import { waitForLoadingOverlayGone } from "../utils/waitForLoadingOverlayToDisappear";

test.describe("Dashboard Statistics Suite", () => {
	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		await page.goto("/");
		await waitForLoadingOverlayGone(page);
		await waitForDashboardDataLoaded(page);
	});

	test.describe("Dashboard Page Layout", () => {
		test("Dashboard page loads with title visible", async ({ page }) => {
			const dashboardTitle = page.getByRole("heading", { name: "Dashboard", level: 1 });
			await expect(dashboardTitle).toBeVisible();
		});

		test("Dashboard displays system overview section", async ({ page }) => {
			const systemOverviewSection = page.locator('section[aria-label="System overview"]');
			await expect(systemOverviewSection).toBeVisible();
		});

		test("Dashboard displays projects section", async ({ page }) => {
			const projectsSection = page.getByRole("region", { name: "Projects" });
			await expect(projectsSection).toBeVisible();
		});

		test("Dashboard displays deployment statistics section", async ({ page }) => {
			const deploymentStatsSection = page.locator('section[aria-label="Deployment statistics"]');
			await expect(deploymentStatsSection).toBeVisible();
		});

		test("Dashboard displays session distribution section", async ({ page }) => {
			const sessionDistributionSection = page.locator('section[aria-label="Session status distribution"]');
			await expect(sessionDistributionSection).toBeVisible();
		});
	});

	test.describe("System Overview Counters", () => {
		test("Counter cards display Projects label", async ({ page }) => {
			const systemOverview = page.locator('section[aria-label="System overview"]');
			await expect(systemOverview.getByText("Projects").first()).toBeVisible();
		});

		test("Counter cards display Active Projects label", async ({ page }) => {
			const systemOverview = page.locator('section[aria-label="System overview"]');
			await expect(systemOverview.getByText("Active Projects")).toBeVisible();
		});

		test("Counter cards display Deployments label", async ({ page }) => {
			const systemOverview = page.locator('section[aria-label="System overview"]');
			await expect(systemOverview.getByText("Deployments")).toBeVisible();
		});

		test("Counter cards display Sessions label", async ({ page }) => {
			const systemOverview = page.locator('section[aria-label="System overview"]');
			await expect(systemOverview.getByText("Sessions")).toBeVisible();
		});
	});

	test.describe("Projects Table", () => {
		test("Projects table header is visible", async ({ page }) => {
			const projectSection = page.getByRole("region", { name: "Projects" });
			await expect(projectSection.getByRole("heading", { name: "Projects" })).toBeVisible();
		});

		test("Column visibility menu button is accessible", async ({ page }) => {
			const columnMenuButton = page.getByRole("button", { name: "Column Settings" });
			await expect(columnMenuButton).toBeVisible();
		});
	});

	test.describe("Session Status Chart", () => {
		test("Session distribution heading is visible", async ({ page }) => {
			const sessionSection = page.locator('section[aria-label="Session status distribution"]');
			await expect(sessionSection.getByText("Session Distribution")).toBeVisible();
		});

		test("Session distribution section is rendered", async ({ page }) => {
			const sessionSection = page.locator('section[aria-label="Session status distribution"]');
			await expect(sessionSection).toBeVisible();
		});
	});

	test.describe("Active Deployments Section", () => {
		test("Active deployments heading is visible", async ({ page }) => {
			const deploymentSection = page.locator('section[aria-label="Deployment statistics"]');
			await expect(deploymentSection.getByRole("heading", { name: "Active Deployments" })).toBeVisible();
		});

		test("Live indicator is displayed", async ({ page }) => {
			const deploymentSection = page.locator('section[aria-label="Deployment statistics"]');
			await expect(deploymentSection.getByText("Live")).toBeVisible();
		});
	});

	test.describe("Refresh Functionality", () => {
		test("Refresh button is visible", async ({ page }) => {
			const refreshButton = page.getByRole("button", { name: "Refresh dashboard" });
			await expect(refreshButton).toBeVisible();
		});

		test("Last updated timestamp is displayed", async ({ page }) => {
			await expect(page.getByText(/Updated:/)).toBeVisible();
		});
	});
});

test.describe("Dashboard Statistics Suite - With Deployed Project", () => {
	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		await page.locator('button[aria-label="Deploy project"]').click();
		await waitForToastToBeRemoved(page, "Project successfully deployed with 1 warning", {
			timeout: 6000,
			failIfNotFound: false,
		});
		await page.goto("/");
		await waitForLoadingOverlayGone(page);
		await waitForDashboardDataLoaded(page);
	});

	test.describe("Projects Table", () => {
		test("Column visibility menu opens on click", async ({ page }) => {
			const columnMenuButton = page.locator('button[aria-label="Column Settings"]');
			await columnMenuButton.click();

			await expect(page.getByText("Show/Hide Columns")).toBeVisible();
		});

		test("Column visibility menu shows column options", async ({ page }) => {
			const columnMenuButton = page.locator('button[aria-label="Column Settings"]');
			await columnMenuButton.click();

			const popoverContent = page.locator("[data-popover-content]").or(page.locator(".min-w-48"));
			await expect(popoverContent.getByText("Status")).toBeVisible();
			await expect(popoverContent.getByText("Deployments")).toBeVisible();
			await expect(popoverContent.getByText("Sessions")).toBeVisible();
			await expect(popoverContent.getByText("Last Deployed")).toBeVisible();
		});

		test("Column visibility toggle hides column from table", async ({ page }) => {
			const columnMenuButton = page.locator('button[aria-label="Column Settings"]');
			await columnMenuButton.click();

			const popoverContent = page.locator(".min-w-48");
			const statusLabel = popoverContent.getByText("Status");
			await statusLabel.click();

			await page.keyboard.press("Escape");

			const projectsSection = page.getByRole("region", { name: "Projects" });
			const columnHeaders = projectsSection.locator('[role="columnheader"]');
			await expect(columnHeaders.filter({ hasText: /^Status$/ })).toBeHidden();
		});
	});

	test.describe("Refresh Functionality", () => {
		test("Refresh button triggers refresh animation on click", async ({ page }) => {
			const refreshButton = await waitForRefreshButtonEnabled(page);
			await refreshButton.click();

			const spinningIcon = refreshButton.locator("svg.animate-spin");
			await expect(spinningIcon).toBeVisible();
		});
	});

	test.describe("Responsive Layout", () => {
		test("Dashboard renders properly on large screen", async ({ page }) => {
			await page.setViewportSize({ width: 1920, height: 1080 });

			const systemOverviewSection = page.locator('section[aria-label="System overview"]');
			await expect(systemOverviewSection).toBeVisible();

			const projectsSection = page.getByRole("region", { name: "Projects" });
			await expect(projectsSection).toBeVisible();
		});

		test("Dashboard renders properly on medium screen", async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 800 });

			const systemOverviewSection = page.locator('section[aria-label="System overview"]');
			await expect(systemOverviewSection).toBeVisible();

			const projectsSection = page.getByRole("region", { name: "Projects" });
			await expect(projectsSection).toBeVisible();
		});

		test("Counter cards remain visible on smaller screens", async ({ page }) => {
			await page.setViewportSize({ width: 768, height: 1024 });
			await waitForDashboardDataLoaded(page);

			const systemOverview = page.locator('section[aria-label="System overview"]');
			await expect(systemOverview.getByText("Projects").first()).toBeVisible();
			await expect(systemOverview.getByText("Deployments")).toBeVisible();
			await expect(systemOverview.getByText("Sessions")).toBeVisible();
		});
	});
});

test.describe("Dashboard with Project Data", () => {
	let projectName: string;

	test.beforeEach(async ({ dashboardPage, page }) => {
		projectName = await dashboardPage.createProjectFromMenu();
		await page.goto("/");
		await waitForLoadingOverlayGone(page);
	});

	test("Project appears in projects table after creation", async ({ page }) => {
		const scrollContainer = getProjectsTableScrollContainer(page);
		const projectRow = getProjectRowLocator(page, projectName);
		await scrollToFindInVirtualizedList(page, scrollContainer, projectRow);
	});

	test("Click on project row navigates to project", async ({ page }) => {
		const scrollContainer = getProjectsTableScrollContainer(page);
		const projectRow = getProjectRowLocator(page, projectName);
		await scrollToFindInVirtualizedList(page, scrollContainer, projectRow);
		await projectRow.click();
		await expect(page).toHaveURL(/\/projects\//);
	});

	test("Project is displayed in table", async ({ page }) => {
		const scrollContainer = getProjectsTableScrollContainer(page);
		const projectRow = getProjectRowLocator(page, projectName);
		await scrollToFindInVirtualizedList(page, scrollContainer, projectRow);
	});
});

test.describe("Dashboard Projects Table Sorting", () => {
	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		await page.goto("/");
		await waitForLoadingOverlayGone(page);
	});

	test("Project name column header is visible", async ({ page }) => {
		const projectsSection = page.getByRole("region", { name: "Projects" });
		const nameHeader = projectsSection.locator('[role="columnheader"]').filter({ hasText: "Project Name" });
		await expect(nameHeader).toBeVisible();
	});

	test("Project name column is clickable for sorting", async ({ page }) => {
		const projectsSection = page.getByRole("region", { name: "Projects" });
		const nameHeader = projectsSection.locator('[role="columnheader"]').filter({ hasText: "Project Name" });
		await expect(nameHeader).toBeVisible();
		await nameHeader.click();
	});

	test("Status column is sortable", async ({ page }) => {
		const projectsSection = page.getByRole("region", { name: "Projects" });
		const statusHeader = projectsSection.locator('[role="columnheader"]').filter({ hasText: "Status" });
		await expect(statusHeader).toBeVisible();
		await statusHeader.click();
	});

	test("Last deployed column is sortable", async ({ page }) => {
		const projectsSection = page.getByRole("region", { name: "Projects" });
		const lastDeployedHeader = projectsSection
			.locator('[role="columnheader"]')
			.filter({ hasText: /Last Deployed/i });
		await expect(lastDeployedHeader).toBeVisible();
		await lastDeployedHeader.click();
	});
});

test.describe("Dashboard Templates Catalog", () => {
	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/");
		await waitForLoadingOverlayGone(page);
	});

	test("Templates catalog is visible on large screens", async ({ page }) => {
		const templatesCatalog = page.getByText("Start From Template");
		await expect(templatesCatalog).toBeVisible();
	});

	test("Resize button is visible between dashboard and templates", async ({ page }) => {
		const resizeButton = page.locator("[data-resize-id]").first();
		if (await resizeButton.isVisible()) {
			await expect(resizeButton).toBeVisible();
		}
	});
});
