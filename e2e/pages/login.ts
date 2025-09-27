import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
	readonly page: Page;

	// Main elements
	private readonly logoText: Locator;
	private readonly pageTitle: Locator;
	private readonly pageSubtitle: Locator;
	private readonly authSection: Locator;

	// OAuth provider buttons
	private readonly githubButton: Locator;
	private readonly googleButton: Locator;
	private readonly microsoftButton: Locator;

	// Other elements
	private readonly loader: Locator;

	// Error boundary elements
	private readonly errorBoundary: Locator;
	private readonly errorMessage: Locator;
	private readonly retryButton: Locator;

	constructor(page: Page) {
		this.page = page;

		// Main elements
		this.logoText = this.page.getByTestId("header-logo-text");
		this.pageTitle = this.page.getByTestId("welcome-title");
		this.pageSubtitle = this.page.getByTestId("welcome-subtitle");
		this.authSection = this.page.getByTestId("auth-section");

		// OAuth provider buttons
		this.githubButton = this.page.getByTestId("oauth-button-github");
		this.googleButton = this.page.getByTestId("oauth-button-google");
		this.microsoftButton = this.page.getByTestId("oauth-button-microsoft");

		this.loader = this.page.getByTestId("auth-loader");

		// Error boundary elements
		this.errorBoundary = this.page.getByTestId("oauth-error-boundary");
		this.errorMessage = this.page.getByTestId("error-message");
		this.retryButton = this.page.getByTestId("retry-button");
	}

	getByRole(role: Parameters<Page["getByRole"]>[0], options?: Parameters<Page["getByRole"]>[1]) {
		return this.page.getByRole(role, options);
	}

	getByTestId(testId: string) {
		return this.page.getByTestId(testId);
	}

	getByText(text: string) {
		return this.page.getByText(text);
	}

	/**
	 * Navigate to the login page
	 * NOTE: Auth headers are automatically cleared for tests with 'login' in title/filename via fixtures.ts
	 */
	async goto() {
		// Clear any existing auth cookies/tokens to ensure we see the login page
		await this.page.context().clearCookies();
		await this.page.context().clearPermissions();

		await this.page.goto("/");
		await this.page.waitForLoadState("domcontentloaded");

		// Wait a bit for any redirects or authentication checks and login page to load
		await this.page.waitForTimeout(2000);
	}

	/**
	 * Wait for the login page to be fully loaded
	 */
	async waitForLoad() {
		// Wait for either the login page elements or check if we're on a different page
		try {
			await expect(this.logoText).toBeVisible({ timeout: 10000 });
			await expect(this.pageTitle).toBeVisible();
		} catch (error) {
			// If login elements aren't found, check what page we're actually on
			const url = await this.page.url();
			const title = await this.page.title();
			console.log(`Expected login page, but found URL: ${url}, Title: ${title}`);
			throw error;
		}
	}

	/**
	 * Verify all OAuth buttons are present and visible
	 */
	async verifyOAuthButtons() {
		await expect(this.githubButton).toBeVisible();
		await expect(this.googleButton).toBeVisible();
		await expect(this.microsoftButton).toBeVisible();
	}

	/**
	 * Click on a specific OAuth provider button
	 */
	async clickOAuthProvider(provider: "github" | "google" | "microsoft") {
		const buttonMap = {
			github: this.githubButton,
			google: this.googleButton,
			microsoft: this.microsoftButton,
		};

		const button = buttonMap[provider];
		await expect(button).toBeVisible();
		await expect(button).toBeEnabled();
		await button.click();
	}

	/**
	 * Verify the page is in loading state
	 */
	async verifyLoadingState() {
		await expect(this.loader).toBeVisible();
	}

	/**
	 * Verify error boundary is displayed with error message
	 */
	async verifyErrorBoundary(expectedError?: string) {
		await expect(this.errorBoundary).toBeVisible();
		await expect(this.errorMessage).toBeVisible();

		if (expectedError) {
			await expect(this.errorMessage).toContainText(expectedError);
		}
	}

	/**
	 * Click the retry button in error boundary
	 */
	async clickRetry() {
		await expect(this.retryButton).toBeVisible();
		await expect(this.retryButton).toBeEnabled();
		await this.retryButton.click();
	}

	/**
	 * Verify page accessibility and basic structure
	 */
	async verifyPageStructure() {
		// Check branding
		await expect(this.logoText).toBeVisible();

		// Check main content
		await expect(this.pageTitle).toBeVisible();
		await expect(this.pageSubtitle).toBeVisible();
		await expect(this.authSection).toBeVisible();

		// Check OAuth buttons are keyboard accessible
		await expect(this.githubButton).toBeVisible();
		await expect(this.googleButton).toBeVisible();
		await expect(this.microsoftButton).toBeVisible();

		// Verify buttons are focusable
		await this.githubButton.focus();
		await expect(this.githubButton).toBeFocused();
	}

	/**
	 * Mock OAuth provider redirect for testing
	 */
	async mockOAuthRedirect(_provider: string, success: boolean = true) {
		if (success) {
			// Mock successful OAuth callback
			await this.page.route(`**/auth/callback**`, (route) => {
				route.fulfill({
					status: 200,
					body: JSON.stringify({
						ok: true,
						sessionToken: "mock-jwt-token",
					}),
				});
			});
		} else {
			// Mock failed OAuth callback
			await this.page.route(`**/auth/callback**`, (route) => {
				route.fulfill({
					status: 400,
					body: JSON.stringify({
						ok: false,
						error: "OAuth authentication failed",
					}),
				});
			});
		}
	}

	/**
	 * Get current URL for redirect validation
	 */
	async getCurrentUrl(): Promise<string> {
		return this.page.url();
	}

	/**
	 * Wait for navigation after OAuth button click
	 */
	async waitForNavigation() {
		await this.page.waitForNavigation();
	}
}
