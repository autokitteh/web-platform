import type { Page } from "@playwright/test";

import { getTestIdFromText } from "./test.utils";

const closeToastDuration = 4000;

export const waitForToastToBeRemoved = async (
	page: Page,
	toastMessage: string,
	options: { failIfNotFound?: boolean; timeout?: number } = { timeout: 2000, failIfNotFound: true }
) => {
	const timeout = options.timeout;
	const failIfNotFound = options.failIfNotFound;

	let toast;

	const roleToast = page.getByRole("alert", { name: toastMessage });
	const isToastByRoleVisible = await roleToast.isVisible({ timeout }).catch(() => false);
	if (isToastByRoleVisible) {
		toast = roleToast;
	}

	if (!toast) {
		const toastTestId = getTestIdFromText("toast", toastMessage);
		const testIdToast = await page.getByTestId(toastTestId);
		const isToastByIdVisible = await testIdToast.isVisible({ timeout }).catch(() => false);
		if (isToastByIdVisible) {
			toast = testIdToast;
		}
	}

	if (!toast) {
		if (failIfNotFound) {
			throw new Error(`Toast with message "${toastMessage}" was not found`);
		}
		return;
	}

	try {
		const toastCloseButtonTestId = getTestIdFromText("toast-close-btn", toastMessage);

		const toastCloseButton = await toast.getByTestId(toastCloseButtonTestId);

		const isToastCloseButtonVisible = await toastCloseButton
			.isVisible({ timeout: closeToastDuration })
			.catch(() => false);

		if (isToastCloseButtonVisible) {
			await toastCloseButton.click();
		}

		await toast.waitFor({ state: "hidden", timeout: closeToastDuration });
	} catch (error) {
		if (failIfNotFound) {
			throw error;
		}
	}
};
