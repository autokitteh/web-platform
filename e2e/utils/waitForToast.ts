import type { Page } from "@playwright/test";

const TOAST_DURATION_MS = 3000;

export const waitForToast = async (page: Page, toastMessage: string, timeout = TOAST_DURATION_MS * 1.5) => {
	const toast = page.locator(`[role="alert"]`, { hasText: toastMessage }).last();
	await toast.waitFor({ state: "visible", timeout });
	return toast;
};

export const waitForToastToBeRemoved = async (page: Page, toastMessage: string, timeout = TOAST_DURATION_MS * 4) => {
	const toast = await waitForToast(page, toastMessage, timeout);
	const closeButton = toast.locator('button[aria-label^="Close"]');
	await closeButton.click();
	await toast.waitFor({ state: "hidden", timeout });
};
