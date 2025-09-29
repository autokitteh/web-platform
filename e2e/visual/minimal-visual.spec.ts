import { test } from "../fixtures";
import { VisualTestHelpers } from "../utils/visual-helpers";

test.describe("Minimal Visual Tests", () => {
	test("homepage screenshot", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");
		await page.waitForTimeout(2000);

		await VisualTestHelpers.takeStableScreenshot(page, "homepage.png", {
			fullPage: true,
		});
	});

	test("login page screenshot", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");
		await page.waitForTimeout(2000);

		await VisualTestHelpers.takeStableScreenshot(page, "login.png", {
			fullPage: true,
		});
	});
});
