import type { Page } from "@playwright/test";

export const waitForToast = async (page: Page, toastMessage: string, timeout = 10000) => {
	const toast = page.locator(`[role="alert"]`, { hasText: toastMessage }).last();
	await toast.waitFor({ state: "visible", timeout });
	return toast;
};

export const waitForToastToBeRemoved = async (page: Page, toastMessage: string, timeout = 10000) => {
	const toast = await waitForToast(page, toastMessage, timeout);
	await toast.waitFor({ state: "hidden", timeout });
};
