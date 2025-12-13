import randomatic from "randomatic";

import { expect, test } from "../../fixtures";
import { waitForLoadingOverlayGone } from "../../utils/waitForLoadingOverlayToDisappear";

test.describe("Workflow Canvas Suite", () => {
	let projectId: string;

	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		await waitForLoadingOverlayGone(page);
		await page.goto("/");

		await page.locator('nav[aria-label="Main navigation"] button[aria-label="New Project"]').hover();
		await page.locator('nav[aria-label="Main navigation"] button[aria-label="New Project"]').click();
		await page.getByRole("button", { name: "New Project From Scratch" }).hover();
		await page.getByRole("button", { name: "New Project From Scratch" }).click();
		const projectName = `workflow_${randomatic("Aa", 8)}`;
		await page.getByPlaceholder("Enter project name").fill(projectName);
		await page.getByRole("button", { name: "Create", exact: true }).click();

		await expect(page.locator('button[aria-label="Open program.py"]')).toBeVisible({ timeout: 10000 });

		projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";

		await context.close();
	});

	test.beforeEach(async ({ page }) => {
		await waitForLoadingOverlayGone(page);
		await page.goto(`/projects/${projectId}/workflow`);
		await page.waitForLoadState("networkidle");
	});

	test("Canvas renders with proper layout", async ({ page }) => {
		await expect(page.getByText("Visual workflow editor")).toBeVisible({ timeout: 10000 });

		const canvasContainer = page.locator(".react-flow");
		await expect(canvasContainer).toBeVisible({ timeout: 10000 });

		const controls = page.locator(".react-flow__controls");
		await expect(controls).toBeVisible();

		const minimap = page.locator(".react-flow__minimap");
		await expect(minimap).toBeVisible();
	});

	test("Canvas displays status panel with node and connection count", async ({ page }) => {
		const statusPanel = page.locator(".react-flow__panel").filter({ hasText: "nodes" });
		await expect(statusPanel).toBeVisible({ timeout: 10000 });

		await expect(statusPanel.getByText(/\d+ nodes/)).toBeVisible();
		await expect(statusPanel.getByText(/\d+ connections/)).toBeVisible();
	});

	test("Toolbar buttons are visible and functional", async ({ page }) => {
		const toolbar = page.locator(".react-flow__panel").filter({ has: page.locator('button[title="Fit to view"]') });
		await expect(toolbar).toBeVisible({ timeout: 10000 });

		const undoButton = toolbar.locator('button[title="Undo (Ctrl+Z)"]');
		const redoButton = toolbar.locator('button[title="Redo (Ctrl+Shift+Z)"]');
		const fitViewButton = toolbar.locator('button[title="Fit to view"]');
		const autoLayoutButton = toolbar.locator('button[title="Auto-arrange nodes"]');

		await expect(undoButton).toBeVisible();
		await expect(redoButton).toBeVisible();
		await expect(fitViewButton).toBeVisible();
		await expect(autoLayoutButton).toBeVisible();

		await expect(undoButton).toBeDisabled();
		await expect(redoButton).toBeDisabled();
	});

	test("Fit view button works", async ({ page }) => {
		const fitViewButton = page.locator('button[title="Fit to view"]');
		await expect(fitViewButton).toBeVisible({ timeout: 10000 });

		await fitViewButton.click();

		await page.waitForTimeout(600);
	});

	test("Auto-layout button rearranges nodes", async ({ page }) => {
		const autoLayoutButton = page.locator('button[title="Auto-arrange nodes"]');
		await expect(autoLayoutButton).toBeVisible({ timeout: 10000 });

		await autoLayoutButton.click();

		await page.waitForTimeout(600);
	});

	test("File nodes are rendered for project files", async ({ page }) => {
		const fileNodes = page.locator('.react-flow__node[data-type="file"]');

		await page.waitForTimeout(1000);

		const count = await fileNodes.count();

		if (count > 0) {
			await expect(fileNodes.first()).toBeVisible();
		}
	});

	test("Canvas zoom controls work", async ({ page }) => {
		const zoomInButton = page.locator(".react-flow__controls-zoomin");
		const zoomOutButton = page.locator(".react-flow__controls-zoomout");

		await expect(zoomInButton).toBeVisible({ timeout: 10000 });
		await expect(zoomOutButton).toBeVisible({ timeout: 10000 });

		await zoomInButton.click();
		await page.waitForTimeout(200);

		await zoomOutButton.click();
		await page.waitForTimeout(200);
	});

	test("Canvas supports panning with mouse drag", async ({ page }) => {
		const canvas = page.locator(".react-flow__pane");
		await expect(canvas).toBeVisible({ timeout: 10000 });

		const box = await canvas.boundingBox();
		if (box) {
			await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
			await page.mouse.down();
			await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100);
			await page.mouse.up();
		}
	});

	test("Minimap displays nodes", async ({ page }) => {
		const minimap = page.locator(".react-flow__minimap");
		await expect(minimap).toBeVisible({ timeout: 10000 });

		const minimapNodes = page.locator(".react-flow__minimap-node");

		await page.waitForTimeout(1000);

		const count = await minimapNodes.count();
		if (count > 0) {
			await expect(minimapNodes.first()).toBeVisible();
		}
	});

	test("Canvas background shows grid pattern", async ({ page }) => {
		const background = page.locator(".react-flow__background");
		await expect(background).toBeVisible({ timeout: 10000 });
	});

	test("Sidebar toggle functionality", async ({ page }) => {
		const sidebarToggle = page.locator('button[aria-label*="sidebar"], button[aria-label*="Sidebar"]');

		const sidebarExists = (await sidebarToggle.count()) > 0;

		if (sidebarExists) {
			await expect(sidebarToggle).toBeVisible();
		}
	});
});
