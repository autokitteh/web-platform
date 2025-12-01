import type { Page } from "@playwright/test";

export const waitForToast = async (page: Page, toastMessage: string, timeout = 10000) => {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const toast = page.locator(`[role="alert"]`, { hasText: toastMessage }).last();
		if (await toast.isVisible()) {
			return toast;
		}
	}
	throw new Error(`Toast with message "${toastMessage}" not found`);
};

export const waitForToastToBeRemoved = async (page: Page, toastMessage: string, timeout = 10000) => {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const toast = page.locator(`[role="alert"]`, { hasText: toastMessage }).last();
		if (!(await toast.isVisible())) {
			return;
		}
	}
	throw new Error(`Toast with message "${toastMessage}" not removed`);
};
