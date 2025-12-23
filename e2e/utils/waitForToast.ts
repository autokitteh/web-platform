import type { Page } from "@playwright/test";

import { closeToastDuration } from "@src/constants";

export const waitForToast = async (page: Page, toastMessage: string, timeout = closeToastDuration * 1.5) => {
	const toast = page.locator(`[role="alert"]`, { hasText: toastMessage }).last();
	await toast.waitFor({ state: "visible", timeout });
	return toast;
};

export const waitForToastToBeRemoved = async (page: Page, toastMessage: string, timeout = closeToastDuration * 4) => {
	const toast = await waitForToast(page, toastMessage, timeout);
	await toast.waitFor({ state: "hidden", timeout });
};
