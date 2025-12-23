import type { Page } from "@playwright/test";

const totalDurationMs = 3000;

export const waitForToast = async (page: Page, toastMessage: string, timeout = totalDurationMs * 1.5) => {
	const toast = page.locator(`[role="alert"]`, { hasText: toastMessage }).last();
	await toast.waitFor({ state: "visible", timeout });
	return toast;
};

export const waitForToastToBeRemoved = async (
	page: Page,
	toastMessage: string,
	toastLevel: "Success" | "Error" | "Warning",
	timeout = totalDurationMs * 4
) => {
	const toast = await waitForToast(page, toastMessage, timeout);
	await page.getByRole("button", { name: `Close "${toastLevel} ${toastMessage}"` }).click();

	await toast.waitFor({ state: "hidden", timeout });
};
