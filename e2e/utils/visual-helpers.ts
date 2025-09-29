import { Page, Locator } from "@playwright/test";

export class VisualTestHelpers {
	/**
	 * Wait for animations and transitions to complete
	 */
	static async waitForStableState(page: Page, timeoutMs: number = 1000) {
		await page.waitForTimeout(timeoutMs);
		await page.waitForLoadState("domcontentloaded");
		await page.waitForLoadState("networkidle");
	}

	/**
	 * Disable animations for more stable screenshots
	 */
	static async disableAnimations(page: Page) {
		await page.addStyleTag({
			content: `
				*,
				*::before,
				*::after {
					animation-duration: 0.01ms !important;
					animation-delay: 0.01ms !important;
					transition-duration: 0.01ms !important;
					transition-delay: 0.01ms !important;
					scroll-behavior: auto !important;
				}
			`,
		});
	}

	/**
	 * Set consistent fonts for cross-platform testing
	 */
	static async setConsistentFonts(page: Page) {
		await page.addStyleTag({
			content: `
				* {
					font-family: "Arial", sans-serif !important;
				}
			`,
		});
	}

	/**
	 * Hide potentially inconsistent elements (scrollbars, cursors, etc.)
	 */
	static async hideInconsistentElements(page: Page) {
		await page.addStyleTag({
			content: `
				::-webkit-scrollbar {
					display: none !important;
				}
				* {
					scrollbar-width: none !important;
					cursor: default !important;
				}
			`,
		});
	}

	/**
	 * Prepare page for visual testing with consistent settings
	 */
	static async preparePageForVisualTesting(page: Page) {
		await this.disableAnimations(page);
		await this.hideInconsistentElements(page);
		await this.waitForStableState(page);
	}

	/**
	 * Take screenshot with consistent settings
	 */
	static async takeStableScreenshot(
		elementOrPage: Page | Locator,
		filename: string,
		options: {
			fullPage?: boolean;
			maxDiffPixels?: number;
			threshold?: number;
		} = {}
	) {
		const screenshotOptions = {
			animations: "disabled" as const,
			threshold: options.threshold || 0.15,
			maxDiffPixels: options.maxDiffPixels || 100,
			...options,
		};

		if ("url" in elementOrPage) {
			// It's a Page - use expect for named screenshots
			const { expect } = await import("@playwright/test");
			return await expect(elementOrPage as Page).toHaveScreenshot(filename, {
				...screenshotOptions,
				fullPage: options.fullPage || false,
			});
		} else {
			// It's a Locator - use expect for named screenshots
			const { expect } = await import("@playwright/test");
			return await expect(elementOrPage as Locator).toHaveScreenshot(filename, {
				...screenshotOptions,
			});
		}
	}

	/**
	 * Common viewport sizes for responsive testing
	 */
	static readonly VIEWPORTS = {
		mobile: { width: 375, height: 667 },
		tablet: { width: 768, height: 1024 },
		desktop: { width: 1920, height: 1080 },
		largeDesktop: { width: 2560, height: 1440 },
	};

	/**
	 * Test element across multiple viewport sizes
	 */
	static async testResponsiveElement(
		page: Page,
		element: Locator,
		baseName: string,
		viewports: Array<keyof typeof VisualTestHelpers.VIEWPORTS> = ["mobile", "tablet", "desktop"]
	) {
		for (const viewportName of viewports) {
			const viewport = this.VIEWPORTS[viewportName];
			await page.setViewportSize(viewport);
			await this.waitForStableState(page, 500);

			await this.takeStableScreenshot(element, `${baseName}-${viewportName}.png`);
		}
	}

	/**
	 * Test element in both light and dark modes
	 */
	static async testThemeVariations(page: Page, element: Locator, baseName: string) {
		// Light mode
		await page.emulateMedia({ colorScheme: "light" });
		await this.waitForStableState(page, 500);
		await this.takeStableScreenshot(element, `${baseName}-light.png`);

		// Dark mode
		await page.emulateMedia({ colorScheme: "dark" });
		await this.waitForStableState(page, 500);
		await this.takeStableScreenshot(element, `${baseName}-dark.png`);
	}

	/**
	 * Test interactive states (hover, focus, active)
	 */
	static async testInteractiveStates(page: Page, element: Locator, baseName: string) {
		// Normal state
		await this.takeStableScreenshot(element, `${baseName}-normal.png`);

		// Hover state
		await element.hover();
		await page.waitForTimeout(200);
		await this.takeStableScreenshot(element, `${baseName}-hover.png`);

		// Focus state
		await element.focus();
		await page.waitForTimeout(200);
		await this.takeStableScreenshot(element, `${baseName}-focus.png`);

		// Reset state
		await page.mouse.move(0, 0);
		await page.keyboard.press("Tab");
		await page.waitForTimeout(200);
	}

	/**
	 * Mock consistent timestamps for testing
	 */
	static async mockConsistentTime(page: Page, fixedDate: string = "2024-01-01T12:00:00.000Z") {
		await page.addInitScript(`
			const mockDate = new Date('${fixedDate}');
			Date = class extends Date {
				constructor(...args) {
					if (args.length === 0) {
						super(mockDate);
					} else {
						super(...args);
					}
				}
				static now() {
					return mockDate.getTime();
				}
			};
		`);
	}

	/**
	 * Hide dynamic content that changes between test runs
	 */
	static async hideDynamicContent(page: Page, selectors: string[] = []) {
		const defaultSelectors = [
			'[data-testid*="timestamp"]',
			'[data-testid*="time"]',
			'[class*="time"]',
			".timestamp",
			".time-ago",
		];

		const allSelectors = [...defaultSelectors, ...selectors];

		for (const selector of allSelectors) {
			await page.addStyleTag({
				content: `${selector} { visibility: hidden !important; }`,
			});
		}
	}

	/**
	 * Wait for images and fonts to load completely
	 */
	static async waitForAssetsToLoad(page: Page) {
		await page.waitForFunction(() => {
			// Check if all images are loaded
			const images = Array.from(document.querySelectorAll("img"));
			const imagesLoaded = images.every((img) => img.complete && img.naturalHeight !== 0);

			// Check if fonts are loaded (document.fonts.status is 'loaded' when ready)
			const fontsLoaded = document.fonts ? document.fonts.status === "loaded" : true;

			return imagesLoaded && fontsLoaded;
		});
	}
}

/**
 * Common screenshot options for consistent visual testing
 */
export const VISUAL_TEST_OPTIONS = {
	fullPage: {
		fullPage: true,
		animations: "disabled" as const,
	},
	component: {
		animations: "disabled" as const,
	},
	strict: {
		threshold: 0.05,
		maxDiffPixels: 50,
		animations: "disabled" as const,
	},
	relaxed: {
		threshold: 0.25,
		maxDiffPixels: 200,
		animations: "disabled" as const,
	},
};
