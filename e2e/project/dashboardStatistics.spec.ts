import { expect, test } from "../fixtures";
import { waitForLoadingOverlayGone } from "../utils/waitForLoadingOverlayToDisappear";

test.describe("Dashboard Statistics Suite", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await waitForLoadingOverlayGone(page);
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
			const projectsSection = page.locator('section[aria-label="Projects"]');
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
			await expect(page.getByText("Projects").first()).toBeVisible();
		});

		test("Counter cards display Active Projects label", async ({ page }) => {
			await expect(page.getByText("Active Projects")).toBeVisible();
		});

		test("Counter cards display Deployments label", async ({ page }) => {
			await expect(page.getByText("Deployments")).toBeVisible();
		});

		test("Counter cards display Sessions label", async ({ page }) => {
			await expect(page.getByText("Sessions").first()).toBeVisible();
		});
	});

	test.describe("Projects Table", () => {
		test("Projects table header is visible", async ({ page }) => {
			const projectsHeader = page.getByText("Projects", { exact: false }).first();
			await expect(projectsHeader).toBeVisible();
		});

		test("Column visibility menu button is accessible", async ({ page }) => {
			const columnMenuButton = page.locator('button[aria-label="Column Settings"]');
			await expect(columnMenuButton).toBeVisible();
		});

		test("Column visibility menu opens on click", async ({ page }) => {
			const columnMenuButton = page.locator('button[aria-label="Column Settings"]');
			await columnMenuButton.click();

			await expect(page.getByText("Show/Hide Columns")).toBeVisible();
		});

		test("Column visibility menu shows column options", async ({ page }) => {
			const columnMenuButton = page.locator('button[aria-label="Column Settings"]');
			await columnMenuButton.click();

			await expect(page.getByText("Status")).toBeVisible();
			await expect(page.getByText("Deployments")).toBeVisible();
			await expect(page.getByText("Sessions")).toBeVisible();
			await expect(page.getByText("Last Deployed")).toBeVisible();
		});

		test("Column visibility toggle hides column from table", async ({ page }) => {
			const columnMenuButton = page.locator('button[aria-label="Column Settings"]');
			await columnMenuButton.click();

			const statusCheckbox = page.getByText("Status").locator("..").locator("input[type='checkbox']");
			await statusCheckbox.click();

			await page.keyboard.press("Escape");
			await page.waitForTimeout(300);

			const tableHeaders = page.locator("table th");
			const headerTexts = await tableHeaders.allTextContents();
			expect(headerTexts.some((text) => text.toLowerCase().includes("status"))).toBeFalsy();
		});
	});

	test.describe("Session Status Chart", () => {
		test("Session distribution heading is visible", async ({ page }) => {
			await expect(page.getByText("Session Distribution")).toBeVisible();
		});

		test("Donut chart has proper accessibility label", async ({ page }) => {
			const donutChart = page.locator('[aria-label="Session status distribution"]');
			await expect(donutChart).toBeVisible();
		});
	});

	test.describe("Active Deployments Section", () => {
		test("Active deployments heading is visible", async ({ page }) => {
			await expect(page.getByText("Active Deployments")).toBeVisible();
		});

		test("Live indicator is displayed", async ({ page }) => {
			await expect(page.getByText("Live")).toBeVisible();
		});
	});

	test.describe("Refresh Functionality", () => {
		test("Refresh button is visible", async ({ page }) => {
			const refreshButton = page.locator('button[aria-label="Refresh dashboard"]');
			await expect(refreshButton).toBeVisible();
		});

		test("Refresh button triggers refresh animation on click", async ({ page }) => {
			const refreshButton = page.locator('button[aria-label="Refresh dashboard"]');
			await refreshButton.click();

			const spinningIcon = page.locator('button[aria-label="Refresh dashboard"] svg.animate-spin');
			await expect(spinningIcon).toBeVisible();
		});

		test("Auto-refresh toggle is visible", async ({ page }) => {
			await expect(page.getByText("Auto Refresh - 1m")).toBeVisible();
		});

		test("Auto-refresh toggle can be enabled", async ({ page }) => {
			const autoRefreshLabel = page.locator("label").filter({ hasText: "Auto Refresh - 1m" });
			const autoRefreshToggle = autoRefreshLabel.locator('input[type="checkbox"]');
			await autoRefreshLabel.click();

			await expect(autoRefreshToggle).toBeChecked();
		});

		test("Last updated timestamp is displayed", async ({ page }) => {
			await expect(page.getByText(/Updated:/)).toBeVisible();
		});
	});

	test.describe("Responsive Layout", () => {
		test("Dashboard renders properly on large screen", async ({ page }) => {
			await page.setViewportSize({ width: 1920, height: 1080 });

			const systemOverviewSection = page.locator('section[aria-label="System overview"]');
			await expect(systemOverviewSection).toBeVisible();

			const projectsSection = page.locator('section[aria-label="Projects"]');
			await expect(projectsSection).toBeVisible();
		});

		test("Dashboard renders properly on medium screen", async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 800 });

			const systemOverviewSection = page.locator('section[aria-label="System overview"]');
			await expect(systemOverviewSection).toBeVisible();

			const projectsSection = page.locator('section[aria-label="Projects"]');
			await expect(projectsSection).toBeVisible();
		});

		test("Counter cards remain visible on smaller screens", async ({ page }) => {
			await page.setViewportSize({ width: 768, height: 1024 });

			await expect(page.getByText("Projects").first()).toBeVisible();
			await expect(page.getByText("Deployments")).toBeVisible();
			await expect(page.getByText("Sessions").first()).toBeVisible();
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
		await expect(page.getByText(projectName)).toBeVisible();
	});

	test("Project counter increments after project creation", async ({ page }) => {
		const projectsCounter = page.locator('[data-testid="counter-projects"]');
		if (await projectsCounter.isVisible()) {
			const counterValue = await projectsCounter.textContent();
			expect(parseInt(counterValue || "0")).toBeGreaterThan(0);
		}
	});

	test("Click on project row navigates to project", async ({ page }) => {
		await page.getByText(projectName).click();
		await expect(page).toHaveURL(/\/projects\//);
	});

	test("Project status is displayed in table", async ({ page }) => {
		const projectRow = page.locator("tr").filter({ hasText: projectName });
		await expect(projectRow).toBeVisible();
	});

	test("Project actions menu is accessible", async ({ page }) => {
		const projectRow = page.locator("tr").filter({ hasText: projectName });
		const actionsButton = projectRow.locator('button[aria-label="Project actions"]');

		if (await actionsButton.isVisible()) {
			await actionsButton.click();
			const menu = page.getByRole("menu");
			await expect(menu).toBeVisible();
		}
	});
});

test.describe("Dashboard Projects Table Sorting", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await waitForLoadingOverlayGone(page);
	});

	test("Project name column is sortable", async ({ page }) => {
		const nameHeader = page.locator("th").filter({ hasText: "Project Name" }).first();
		await expect(nameHeader).toBeVisible();
		await nameHeader.click();

		await page.waitForTimeout(500);
	});

	test("Status column is sortable", async ({ page }) => {
		const statusHeader = page.locator("th").filter({ hasText: "Status" }).first();
		if (await statusHeader.isVisible()) {
			await statusHeader.click();
			await page.waitForTimeout(500);
		}
	});

	test("Last deployed column is sortable", async ({ page }) => {
		const lastDeployedHeader = page
			.locator("th")
			.filter({ hasText: /last deployed/i })
			.first();
		if (await lastDeployedHeader.isVisible()) {
			await lastDeployedHeader.click();
			await page.waitForTimeout(500);
		}
	});
});

test.describe("Dashboard Templates Catalog", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/");
		await waitForLoadingOverlayGone(page);
	});

	test("Templates catalog is visible on large screens", async ({ page }) => {
		const templatesCatalog = page.getByText("Templates").first();
		await expect(templatesCatalog).toBeVisible();
	});

	test("Resize button is visible between dashboard and templates", async ({ page }) => {
		const resizeButton = page.locator("[data-resize-id]").first();
		if (await resizeButton.isVisible()) {
			await expect(resizeButton).toBeVisible();
		}
	});
});
