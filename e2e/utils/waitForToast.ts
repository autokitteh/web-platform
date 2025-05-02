import { expect, type Page } from "@playwright/test";

export const waitForToast = async (page: Page, toastMessage: string, timeout = 10000) => {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const toast = await page.locator(`[role="alert"]`, { hasText: toastMessage });
		await expect(toast).toBeVisible();
		if (await toast.isVisible()) {
			return toast;
		}
	}
	throw new Error(`Toast with message "${toastMessage}" not found`);
};
