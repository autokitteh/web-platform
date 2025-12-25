/* eslint-disable no-console */
import { expect, type Locator, type Page } from "@playwright/test";

import { getTestIdFromText } from "./test.utils";

const closeToastDuration = 4000;
const toastDisplayTimeout = 4000;

export const waitForToastToBeRemoved = async (page: Page, toastMessage: string) => {
	const closeToast = async (toast: Locator, toastMessage: string) => {
		const toastCloseButtonTestId = getTestIdFromText("toast-close-btn", toastMessage);

		const toastCloseButton = await toast.getByTestId(toastCloseButtonTestId);

		const isToastCloseButtonVisible = await toastCloseButton
			.isVisible({ timeout: closeToastDuration })
			.catch(() => false);

		if (isToastCloseButtonVisible) {
			await toastCloseButton.click();
		}

		await page.waitForTimeout(800);
		await page.mouse.move(0, 0);
		await page.keyboard.press("Escape");

		await expect(toast).not.toBeVisible();
	};

	let toast;
	const toastTestId = getTestIdFromText("toast", toastMessage);

	const roleToast = page.getByRole("alert", { name: toastMessage });
	const isToastByRoleVisible = await roleToast.isVisible({ timeout: toastDisplayTimeout }).catch(() => false);
	if (isToastByRoleVisible) {
		toast = roleToast;
	}

	if (!toast) {
		const testIdToast = page.getByTestId(toastTestId);
		const isToastByIdVisible = await testIdToast.isVisible({ timeout: toastDisplayTimeout }).catch(() => {
			console.warn("Toast was not found", toastMessage, toastTestId);
			return false;
		});
		if (isToastByIdVisible) {
			toast = testIdToast;
		}
	}

	if (!toast) {
		console.warn("Toast was not found", toastMessage, toastTestId);

		return;
	}

	try {
		closeToast(toast, toastMessage);
	} catch (error) {
		console.warn("The close button for toast was not found", toastMessage, error, toastTestId);
	}
};
