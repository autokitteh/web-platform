import { type Locator, type Page } from "@playwright/test";

import { RateLimitHandler } from "../utils";

export abstract class BasePage {
	protected readonly page: Page;
	protected readonly rateLimitHandler: RateLimitHandler;

	constructor(page: Page) {
		this.page = page;
		this.rateLimitHandler = new RateLimitHandler(page);
	}

	async goto(url: string, waitTimeMinutes: number = 0.1): Promise<void> {
		await this.rateLimitHandler.goto(url, waitTimeMinutes);
	}

	async click(selector: string, waitTimeMinutes: number = 0.1): Promise<void> {
		await this.rateLimitHandler.click(selector, waitTimeMinutes);
	}

	async fill(selector: string, value: string, waitTimeMinutes: number = 0.1): Promise<void> {
		await this.rateLimitHandler.fill(selector, value, waitTimeMinutes);
	}

	async hover(selector: string, waitTimeMinutes: number = 0.1): Promise<void> {
		await this.rateLimitHandler.hover(selector, waitTimeMinutes);
	}

	async checkRateLimit(waitTimeMinutes: number = 0.1): Promise<void> {
		await this.rateLimitHandler.checkAndHandleRateLimit(waitTimeMinutes);
	}

	protected getByRole(role: Parameters<Page["getByRole"]>[0], options?: Parameters<Page["getByRole"]>[1]): Locator {
		return this.page.getByRole(role, options);
	}

	protected getByTestId(testId: string): Locator {
		return this.page.getByTestId(testId);
	}

	protected getByPlaceholder(placeholder: string): Locator {
		return this.page.getByPlaceholder(placeholder);
	}

	protected getByText(text: string): Locator {
		return this.page.getByText(text);
	}

	protected locator(selector: string): Locator {
		return this.page.locator(selector);
	}
}
