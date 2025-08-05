import { expect, type Page } from "@playwright/test";

// Default timeout for button clicks (30 seconds)
const defaultButtonTimeout = 30000;

/**
 * Safely clicks a button with proper waiting and fallback strategies
 * This utility helps prevent flaky tests by ensuring buttons are ready before clicking
 */
export async function clickButtonSafely(
	page: Page,
	buttonSelector: string,
	options: { exact?: boolean; timeout?: number } = {}
) {
	const button = page.getByRole("button", { name: buttonSelector, exact: options.exact });
	const timeout = options.timeout || defaultButtonTimeout;

	// Wait for button to be ready
	await expect(button).toBeVisible();
	await expect(button).toBeEnabled();

	// Try normal click first
	try {
		await button.click({ timeout });
	} catch {
		// Fallback: scroll into view and force click
		await button.scrollIntoViewIfNeeded();
		await page.waitForTimeout(500);
		await button.click({ force: true, timeout });
	}
}

/**
 * Safely clicks a tab with proper waiting and fallback strategies
 */
export async function clickTabSafely(page: Page, tabName: string, timeout = defaultButtonTimeout) {
	const tab = page.getByRole("tab", { name: tabName });

	// Wait for tab to be ready
	await expect(tab).toBeVisible();
	await expect(tab).toBeEnabled();

	// Try normal click first
	try {
		await tab.click({ timeout });
	} catch {
		// Fallback: scroll into view and force click
		await tab.scrollIntoViewIfNeeded();
		await page.waitForTimeout(500);
		await tab.click({ force: true, timeout });
	}
}

/**
 * Specialized function for clicking the Close AI Chat button
 * This button has unique positioning and z-index considerations
 */
export async function ClickCloseAIChatSafely(page: Page, timeout = defaultButtonTimeout) {
	// Try multiple selectors for the close button
	const selectors = [
		'button[aria-label="Close AI Chat"]',
		"#close-chatbot-button",
		'button[aria-label="Close AI Chat"] svg',
		".absolute.right-4.top-2 button",
	];

	for (const selector of selectors) {
		try {
			const button = page.locator(selector);
			await expect(button).toBeVisible({ timeout: 3000 });
			await expect(button).toBeEnabled({ timeout: 3000 });

			// Check if button is actually clickable
			const isClickable = await button.evaluate((el) => {
				const rect = el.getBoundingClientRect();
				const style = getComputedStyle(el);
				return rect.width > 0 && rect.height > 0 && style.pointerEvents !== "none" && style.opacity !== "0";
			});

			if (isClickable) {
				await button.click({ timeout });
				return; // Success, exit function
			}
		} catch {
			// Continue to next selector
			continue;
		}
	}

	// If all selectors fail, try force click on the most likely one
	const fallbackButton = page.locator('button[aria-label="Close AI Chat"]');
	await fallbackButton.scrollIntoViewIfNeeded();
	await page.waitForTimeout(1000);
	await fallbackButton.click({ force: true, timeout });
}

/**
 * Debug helper to check button state
 */
export async function debugButtonState(page: Page, buttonSelector: string) {
	const button = page.getByRole("button", { name: buttonSelector });

	// eslint-disable-next-line no-console
	console.log("Button state:", {
		visible: await button.isVisible(),
		enabled: await button.isEnabled(),
		css: await button.evaluate((el) => ({
			pointerEvents: getComputedStyle(el).pointerEvents,
			opacity: getComputedStyle(el).opacity,
			zIndex: getComputedStyle(el).zIndex,
			display: getComputedStyle(el).display,
		})),
	});
}
