import { Page } from "@playwright/test";

export const waitForToast = async (page: Page, toastMessage: string, timeout = 5000) => {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const toast = await page.locator(`[role="alert"]`, { hasText: toastMessage });
		if (await toast.isVisible()) {
			return toast;
		}
		await page.waitForTimeout(100); // Polling interval
	}
	throw new Error(`Toast with message "${toastMessage}" not found`);
};
