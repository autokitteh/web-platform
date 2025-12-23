import type { Page } from "@playwright/test";

import { getTestIdFromText } from "./test.utils";

const closeToastDuration = 3000;

export const waitForToastToBeRemoved = async (page: Page, toastMessage: string) => {
	let toast;

	const roleToast = page.getByRole("alert", { name: toastMessage });
	const isToastByRoleVisible = await roleToast.isVisible({ timeout: 2000 }).catch(() => false);
	if (isToastByRoleVisible) {
		toast = roleToast;
	}

	if (!toast) {
		const toastTestId = getTestIdFromText("toast", toastMessage);
		const testIdToast = await page.getByTestId(toastTestId);
		const isToastByIdVisible = await testIdToast.isVisible({ timeout: 2000 }).catch(() => false);
		if (isToastByIdVisible) {
			toast = testIdToast;
		}
	}

	if (!toast) {
		throw new Error(`Toast with message "${toastMessage}" was not found`);
	}

	const toastCloseButtonTestId = getTestIdFromText("toast-close-btn", toastMessage);

	const toastCloseButton = await toast.getByTestId(toastCloseButtonTestId);

	const isToastCloseButtonVisible = await toastCloseButton
		.isVisible({ timeout: closeToastDuration })
		.catch(() => false);

	if (isToastCloseButtonVisible) {
		await toastCloseButton.click();
	}

	await toast.waitFor({ state: "hidden", timeout: closeToastDuration });
};
