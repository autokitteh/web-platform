import type { Page } from "@playwright/test";

import { getTestIdFromText } from "./test.utils";

const closeToastDuration = 3000;

export const waitForToastToBeRemoved = async (page: Page, toastMessage: string) => {
	let toast;

	const locatorToast = page.locator(`[role="alert"]`, { hasText: toastMessage }).last();
	if (await locatorToast.isVisible({ timeout: closeToastDuration * 1.5 }).catch(() => false)) {
		toast = locatorToast;
	}

	if (!toast) {
		const roleToast = page.getByRole("alert", { name: toastMessage });
		if (await roleToast.isVisible({ timeout: 1000 }).catch(() => false)) {
			toast = roleToast;
		}
	}

	if (!toast) {
		const testIdToast = page.getByTestId(getTestIdFromText("toast", toastMessage));
		if (await testIdToast.isVisible({ timeout: 1000 }).catch(() => false)) {
			toast = testIdToast;
		}
	}

	if (!toast) {
		throw new Error(`Toast with message "${toastMessage}" was not found`);
	}

	const testIdToastCloseButton = page.getByTestId(getTestIdFromText("toast-close-btn", toastMessage));
	if (await testIdToastCloseButton.isVisible({ timeout: 1000 }).catch(() => false)) {
		await testIdToastCloseButton.click();
	}

	await toast.waitFor({ state: "hidden", timeout: closeToastDuration * 1.5 });
};
