import type { Page } from "@playwright/test";

export const waitForLoadingOverlayGone = async (page: Page, timeout = 10000) => {
	try {
		const overlayLocator = page.locator('[id^="loading-overlay-"]');
		if (await overlayLocator.isVisible().catch(() => false)) {
			await overlayLocator.waitFor({ state: "hidden", timeout });
		}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log("No loading overlay found or it disappeared quickly, continuing...");
	}
};
