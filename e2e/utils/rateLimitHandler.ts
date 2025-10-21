import { expect, type Page } from "@playwright/test";

import { rateLimitConfig, rateLimitTimeouts } from "../constants/timeouts";

const DEBUG = process.env.DEBUG_RATE_LIMITER === "true";

export class RateLimitHandler {
	private readonly page: Page;
	private retryCount = 0;
	private readonly modalSelectors = [
		'[data-modal-name="rateLimit"]',
		'.modal:has-text("Rate Limit")',
		'.modal:has-text("rate limit")',
		'div:has(h3:text-matches(".*[Rr]ate.*[Ll]imit.*"))',
	];
	private readonly retryButtonSelectors = [
		'button[aria-label*="Retry"]',
		'button[aria-label*="retry"]',
		'button:has-text("Retry")',
		'button:has-text("retry")',
		'button:has-text("Try Again")',
	];
	private readonly closeButtonSelectors = [
		'button[aria-label="Close"]',
		'button[aria-label="close"]',
		"button.close",
		'[data-testid="close-button"]',
	];

	constructor(page: Page) {
		this.page = page;
	}

	private log(message: string): void {
		if (DEBUG) {
			// eslint-disable-next-line no-console
			console.log(`[RateLimitHandler] ${message}`);
		}
	}

	resetRetryCount(): void {
		this.retryCount = 0;
	}

	async isRateLimitModalVisible(): Promise<boolean> {
		try {
			for (const selector of this.modalSelectors) {
				const modal = this.page.locator(selector);
				const isVisible = await modal.isVisible({ timeout: 1000 });
				if (isVisible) {
					return true;
				}
			}
			return false;
		} catch {
			return false;
		}
	}

	async handleRateLimitModal(waitTimeMinutes: number = rateLimitConfig.defaultResetWaitMinutes): Promise<boolean> {
		if (this.retryCount >= rateLimitConfig.maxRetries) {
			throw new Error(
				`Rate limit persisted after ${rateLimitConfig.maxRetries} retries. Backend may be down or rate limit is too strict.`
			);
		}

		const isModalVisible = await this.isRateLimitModalVisible();

		if (!isModalVisible) {
			return false;
		}

		this.retryCount++;
		this.log(
			`Rate limit modal detected (attempt ${this.retryCount}/${rateLimitConfig.maxRetries}). Waiting ${waitTimeMinutes} minute(s)...`
		);

		await this.page.waitForTimeout(waitTimeMinutes * 60 * 1000);

		let buttonClicked = false;

		for (const selector of this.retryButtonSelectors) {
			try {
				const retryButton = this.page.locator(selector).first();
				if (await retryButton.isVisible({ timeout: 2000 })) {
					await retryButton.click({ timeout: 5000 });
					this.log(`Clicked retry button using selector: ${selector}`);
					buttonClicked = true;
					break;
				}
			} catch {
				continue;
			}
		}

		if (!buttonClicked) {
			this.log("Could not click retry button, trying to close modal manually");

			for (const selector of this.closeButtonSelectors) {
				try {
					const closeButton = this.page.locator(selector).first();
					if (await closeButton.isVisible({ timeout: 2000 })) {
						await closeButton.click({ timeout: 5000 });
						this.log(`Clicked close button using selector: ${selector}`);
						buttonClicked = true;
						break;
					}
				} catch {
					continue;
				}
			}

			if (!buttonClicked) {
				this.log("Using Escape key as fallback to close modal");
				await this.page.keyboard.press("Escape");
			}
		}

		await this.page.waitForTimeout(rateLimitTimeouts.modalVerificationMs);

		let modalClosed = false;
		for (const selector of this.modalSelectors) {
			try {
				await expect(this.page.locator(selector)).not.toBeVisible({ timeout: 6000 });
				modalClosed = true;
				break;
			} catch {
				continue;
			}
		}

		if (!modalClosed) {
			throw new Error("Rate limit modal could not be closed after retry");
		}

		this.log("Rate limit modal handled successfully");
		return true;
	}

	async checkAndHandleRateLimit(waitTimeMinutes: number = rateLimitConfig.defaultResetWaitMinutes): Promise<void> {
		const startTime = Date.now();

		while (Date.now() - startTime < rateLimitTimeouts.pollingTimeoutMs) {
			const handled = await this.handleRateLimitModal(waitTimeMinutes);

			if (handled) {
				await this.page.waitForTimeout(rateLimitTimeouts.modalVerificationMs);
				return;
			}

			await this.page.waitForTimeout(rateLimitTimeouts.pollingIntervalMs);
		}
	}

	async goto(url: string, waitTimeMinutes: number = rateLimitConfig.defaultResetWaitMinutes): Promise<void> {
		await this.page.goto(url);
		await this.checkAndHandleRateLimit(waitTimeMinutes);
	}

	async click(selector: string, waitTimeMinutes: number = rateLimitConfig.defaultResetWaitMinutes): Promise<void> {
		await this.page.locator(selector).click();
		await this.checkAndHandleRateLimit(waitTimeMinutes);
	}

	async fill(
		selector: string,
		value: string,
		waitTimeMinutes: number = rateLimitConfig.defaultResetWaitMinutes
	): Promise<void> {
		await this.page.locator(selector).fill(value);
		await this.checkAndHandleRateLimit(waitTimeMinutes);
	}

	async hover(selector: string, waitTimeMinutes: number = rateLimitConfig.defaultResetWaitMinutes): Promise<void> {
		await this.page.locator(selector).hover();
		await this.checkAndHandleRateLimit(waitTimeMinutes);
	}
}

export async function checkAndHandleRateLimit(
	page: Page,
	waitTimeMinutes: number = rateLimitConfig.defaultResetWaitMinutes
): Promise<void> {
	const handler = new RateLimitHandler(page);
	await handler.checkAndHandleRateLimit(waitTimeMinutes);
}
