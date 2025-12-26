import { expect, test } from "../fixtures";
import { cleanupCurrentProject } from "../utils";

test.describe("Project Topbar Suite", () => {
	test.afterEach(async ({ page }) => {
		await cleanupCurrentProject(page);
	});

	test("Changed deployments topbar", async ({ dashboardPage, projectPage, page }) => {
		await dashboardPage.createProjectFromMenu();

		await expect(page.locator('button[aria-label="Explorer"]')).toHaveClass(/active/);
		await expect(page.locator('button[aria-label="Deployments"]')).not.toHaveClass(/active/);
		await expect(page.locator('button[aria-label="Sessions"]')).toBeDisabled();

		await projectPage.deployProject();

		await page.locator('button[aria-label="Deployments"]').click();

		await expect(page.locator('button[aria-label="Explorer"]')).not.toHaveClass(/active/);
		await expect(page.locator('button[aria-label="Deployments"]')).toHaveClass(/active/);

		await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();
		await page.locator('button[aria-label="Close Project Settings"]').click();

		const activeStatus = page.getByText("Active").first();
		await activeStatus.click();

		await expect(page.locator('button[aria-label="Explorer"]')).not.toHaveClass(/active/);
		await expect(page.locator('button[aria-label="Deployments"]')).not.toHaveClass(/active/);
		await expect(page.locator('button[aria-label="Sessions"]')).toHaveClass(/active/);
	});

	test.describe("Responsive button behavior", () => {
		test.afterEach(async ({ page }) => {
			await cleanupCurrentProject(page);
		});

		test("Navigation buttons - icons always visible on all screen sizes", async ({ dashboardPage, page }) => {
			await page.setViewportSize({ width: 1920, height: 1080 });
			await dashboardPage.createProjectFromMenu();

			await page.waitForTimeout(500);

			const explorerIcon = page.locator('button[aria-label="Explorer"] svg').first();
			const deploymentsIcon = page.locator('button[aria-label="Deployments"] svg').first();
			const configIcon = page.locator('button[aria-label="Config"] svg').first();
			const eventsIcon = page.locator('button[aria-label="Events"] svg').first();

			await expect(explorerIcon).toBeVisible();
			await expect(deploymentsIcon).toBeVisible();
			await expect(configIcon).toBeVisible();
			await expect(eventsIcon).toBeVisible();

			await page.setViewportSize({ width: 1200, height: 800 });

			await expect(explorerIcon).toBeVisible();
			await expect(deploymentsIcon).toBeVisible();
			await expect(configIcon).toBeVisible();
			await expect(eventsIcon).toBeVisible();
		});

		test("Navigation buttons - labels visible on large screens (>= 1280px)", async ({ dashboardPage, page }) => {
			await page.setViewportSize({ width: 1920, height: 1080 });
			await dashboardPage.createProjectFromMenu();

			await page.waitForTimeout(500);

			const explorerLabel = page.locator('button[aria-label="Explorer"] span').first();
			const deploymentsLabel = page.locator('button[aria-label="Deployments"] span').first();
			const configLabel = page.locator('button[aria-label="Config"] span').first();
			const eventsLabel = page.locator('button[aria-label="Events"] span').first();

			await expect(explorerLabel).toBeVisible();
			await expect(deploymentsLabel).toBeVisible();
			await expect(configLabel).toBeVisible();
			await expect(eventsLabel).toBeVisible();
		});

		test("Navigation buttons - labels hidden on small screens (< 1280px)", async ({ dashboardPage, page }) => {
			await page.setViewportSize({ width: 1200, height: 800 });
			await dashboardPage.createProjectFromMenu();

			await page.waitForTimeout(500);

			const explorerLabel = page.locator('button[aria-label="Explorer"] span').first();
			const deploymentsLabel = page.locator('button[aria-label="Deployments"] span').first();
			const configLabel = page.locator('button[aria-label="Config"] span').first();
			const eventsLabel = page.locator('button[aria-label="Events"] span').first();

			await expect(explorerLabel).toBeHidden();
			await expect(deploymentsLabel).toBeHidden();
			await expect(configLabel).toBeHidden();
			await expect(eventsLabel).toBeHidden();
		});

		test("Action buttons - labels visible on large screens (> 1600px)", async ({ dashboardPage, page }) => {
			await page.setViewportSize({ width: 1920, height: 1080 });
			await dashboardPage.createProjectFromMenu();

			const buildButton = page.locator('button[aria-label="Validate project"]');
			const deployButton = page.locator('button[aria-label="Deploy project"]');
			await page.waitForTimeout(800);

			const moreButton = page.locator('button[aria-label="Project additional actions"]');

			await expect(buildButton.getByText("Validate")).toBeVisible();
			await expect(deployButton.getByText("Deploy")).toBeVisible();
			await expect(moreButton.getByText("More")).toBeVisible();
		});

		test("Action buttons - labels hidden on medium screens (<= 1600px)", async ({ dashboardPage, page }) => {
			await page.setViewportSize({ width: 1600, height: 900 });
			await dashboardPage.createProjectFromMenu();

			const buildButton = page.locator('button[aria-label="Validate project"]');
			const deployButton = page.locator('button[aria-label="Deploy project"]');
			await page.waitForTimeout(800);

			const moreButton = page.locator('button[aria-label="Project additional actions"]');

			await expect(buildButton.getByText("Validate")).toBeHidden();
			await expect(deployButton.getByText("Deploy")).toBeHidden();
			await expect(moreButton.getByText("More")).toBeHidden();

			await expect(buildButton.locator("svg").first()).toBeVisible();
			await expect(deployButton.locator("svg").first()).toBeVisible();
			await expect(moreButton.locator("svg").first()).toBeVisible();
		});

		test("Manual run buttons - visible at all screen sizes", async ({ dashboardPage, page }) => {
			await page.setViewportSize({ width: 1920, height: 1080 });
			await dashboardPage.createProjectFromMenu();

			const deployButton = page.locator('button[aria-label="Deploy project"]');
			await deployButton.click();
			await page.waitForTimeout(800);

			const manualRunButton = page.locator('button[aria-label="Run"]');
			const settingsButton = page.locator('button[aria-label="Settings manual run"]');

			await expect(manualRunButton).toBeVisible();
			await expect(settingsButton).toBeVisible();

			await page.setViewportSize({ width: 1200, height: 800 });

			await expect(manualRunButton).toBeVisible();
			await expect(settingsButton).toBeVisible();
		});

		test("Buttons remain functional after viewport resize", async ({ dashboardPage, page }) => {
			await page.setViewportSize({ width: 1920, height: 1080 });
			await dashboardPage.createProjectFromMenu();

			await page.setViewportSize({ width: 1200, height: 800 });

			const deploymentsButton = page.locator('button[aria-label="Deployments"]');
			await deploymentsButton.click();

			await expect(page.locator('button[aria-label="Deployments"]')).toHaveClass(/active/);

			const explorerButton = page.locator('button[aria-label="Explorer"]');
			await explorerButton.click();

			await expect(page.locator('button[aria-label="Explorer"]')).toHaveClass(/active/);
		});

		test("Action buttons icons remain visible when labels hidden", async ({ dashboardPage, page }) => {
			await page.setViewportSize({ width: 1400, height: 900 });
			await dashboardPage.createProjectFromMenu();

			const buildButton = page.locator('button[aria-label="Validate project"]');
			const deployButton = page.locator('button[aria-label="Deploy project"]');
			await page.waitForTimeout(800);

			await expect(buildButton.getByText("Validate")).toBeHidden();
			await expect(deployButton.getByText("Deploy")).toBeHidden();

			await expect(buildButton.locator("svg").first()).toBeVisible();
			await expect(deployButton.locator("svg").first()).toBeVisible();

			await buildButton.click();
			await page.waitForTimeout(1000);

			const buildIconAfterClick = buildButton.locator("svg").first();
			await expect(buildIconAfterClick).toBeVisible();
		});
	});
});
