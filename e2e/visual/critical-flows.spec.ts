import { test } from "../fixtures";
import { VisualTestHelpers } from "../utils/visual-helpers";

/**
 * Critical visual regression tests for Firefox and Safari
 * These tests focus on core user flows and UI components that may render
 * differently across browser engines (Gecko, WebKit vs Chromium)
 */

test.describe("Critical Visual Flows", () => {
	test.beforeEach(async ({ page }) => {
		await VisualTestHelpers.preparePageForVisualTesting(page);
		await VisualTestHelpers.mockConsistentTime(page);
	});

	test("login page layout and styling", async ({ page }) => {
		await page.setExtraHTTPHeaders({
			Authorization: "",
		});

		await page.goto("/");

		await VisualTestHelpers.waitForAssetsToLoad(page);
		await page.waitForLoadState("networkidle");

		await VisualTestHelpers.takeStableScreenshot(page, "login-page-full.png", {
			fullPage: true,
		});
	});

	test("dashboard main layout", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		await page.waitForSelector("h1, main, [data-testid]", { timeout: 10000 });

		await VisualTestHelpers.waitForAssetsToLoad(page);
		await VisualTestHelpers.hideDynamicContent(page, ['[data-testid*="session"]', '[data-testid*="timestamp"]']);

		await VisualTestHelpers.takeStableScreenshot(page, "dashboard-main.png", {
			fullPage: true,
		});
	});

	test("navigation and header consistency", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		await page.waitForSelector("header, nav, [data-testid]", { timeout: 10000 });

		const nav = page.locator("header, nav, [role='navigation']").first();
		if ((await nav.count()) > 0) {
			await VisualTestHelpers.takeStableScreenshot(nav, "main-navigation.png");
		}
	});

	test("basic page elements", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		await VisualTestHelpers.waitForAssetsToLoad(page);

		const main = page.locator("main, [role='main'], body").first();
		await VisualTestHelpers.takeStableScreenshot(main, "main-content.png");
	});
});
