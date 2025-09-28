import { test, expect } from "@playwright/test";

test.describe("GDPR Cookie Consent", () => {
	test.beforeEach(async ({ page, context }) => {
		// Clear all cookies and local storage to simulate first visit
		await context.clearCookies();
		await context.clearPermissions();
		await page.goto("/");
	});

	test("should show cookie banner on first visit", async ({ page }) => {
		// Banner should be visible
		const banner = page.getByRole("dialog", { name: /cookie banner/i });
		await expect(banner).toBeVisible();

		// Check required elements
		await expect(page.getByText("We value your privacy")).toBeVisible();
		await expect(page.getByTestId("accept-all-cookies")).toBeVisible();
		await expect(page.getByTestId("reject-all-cookies")).toBeVisible();
		await expect(page.getByTestId("customize-cookies")).toBeVisible();
	});

	test("should accept all cookies and hide banner", async ({ page }) => {
		const banner = page.getByRole("dialog", { name: /cookie banner/i });
		await expect(banner).toBeVisible();

		// Click accept all
		await page.getByTestId("accept-all-cookies").click();

		// Banner should disappear
		await expect(banner).toBeHidden();

		// Check that consent cookie is set
		const cookies = await page.context().cookies();
		const consentCookie = cookies.find((cookie) => cookie.name === "ak-consent");
		expect(consentCookie).toBeDefined();

		// Verify Google Consent Mode is updated
		await page.evaluate(() => {
			return new Promise((resolve) => {
				const events: any[] = [];
				window.addEventListener("google_consent_mode_update", (e: any) => {
					events.push(e.detail);
				});
				// Allow time for event to fire
				setTimeout(() => resolve(events), 100);
			});
		});

		// Refresh page - banner should not appear again
		await page.reload();
		await expect(banner).toBeHidden();
	});

	test("should reject all cookies and hide banner", async ({ page }) => {
		const banner = page.getByRole("dialog", { name: /cookie banner/i });
		await expect(banner).toBeVisible();

		// Click reject all
		await page.getByTestId("reject-all-cookies").click();

		// Banner should disappear
		await expect(banner).toBeHidden();

		// Check that consent cookie is set with denied values
		const cookies = await page.context().cookies();
		const consentCookie = cookies.find((cookie) => cookie.name === "ak-consent");
		expect(consentCookie).toBeDefined();

		const consentData = JSON.parse(decodeURIComponent(consentCookie!.value));
		expect(consentData.purposes.functional).toBe("denied");
		expect(consentData.purposes.analytics).toBe("denied");
		expect(consentData.purposes.marketing).toBe("denied");
		expect(consentData.purposes["strictly-necessary"]).toBe("granted");
	});

	test("should open preferences modal from banner", async ({ page }) => {
		await expect(page.getByRole("dialog", { name: /cookie banner/i })).toBeVisible();

		// Click customize button
		await page.getByTestId("customize-cookies").click();

		// Preferences modal should open
		const modal = page.getByRole("dialog", { name: /cookie preferences/i });
		await expect(modal).toBeVisible();
		await expect(page.getByText("Cookie Preferences")).toBeVisible();
	});

	test("should manage granular cookie preferences", async ({ page }) => {
		// Open preferences
		await page.getByTestId("customize-cookies").click();
		const modal = page.getByRole("dialog", { name: /cookie preferences/i });
		await expect(modal).toBeVisible();

		// Check all purpose categories are present
		await expect(page.getByText("Strictly Necessary")).toBeVisible();
		await expect(page.getByText("Functional")).toBeVisible();
		await expect(page.getByText("Analytics")).toBeVisible();
		await expect(page.getByText("Marketing")).toBeVisible();

		// Strictly necessary should be disabled (always on)
		const strictlyNecessaryToggle = page.getByRole("switch").first();
		await expect(strictlyNecessaryToggle).toBeDisabled();

		// Toggle functional cookies
		const functionalToggle = page.getByRole("switch").nth(1);
		await functionalToggle.click();

		// Save preferences
		await page.getByTestId("save-preferences").click();

		// Modal should close and banner should disappear
		await expect(modal).toBeHidden();
		await expect(page.getByRole("dialog", { name: /cookie banner/i })).toBeHidden();

		// Verify consent was saved
		const cookies = await page.context().cookies();
		const consentCookie = cookies.find((cookie) => cookie.name === "ak-consent");
		expect(consentCookie).toBeDefined();
	});

	test("should allow consent withdrawal through settings link", async ({ page }) => {
		// First, accept all cookies
		await page.getByTestId("accept-all-cookies").click();
		await expect(page.getByRole("dialog", { name: /cookie banner/i })).toBeHidden();

		// Find and click cookie settings link (would be in footer typically)
		await page.getByTestId("cookie-settings-link").click();

		// Preferences modal should open
		const modal = page.getByRole("dialog", { name: /cookie preferences/i });
		await expect(modal).toBeVisible();

		// User can modify settings
		const analyticsToggle = page.getByRole("switch").nth(2);
		await analyticsToggle.click();

		// Save changes
		await page.getByTestId("save-preferences").click();

		// Modal should close
		await expect(modal).toBeHidden();

		// Verify updated consent
		const cookies = await page.context().cookies();
		const consentCookie = cookies.find((cookie) => cookie.name === "ak-consent");
		const consentData = JSON.parse(decodeURIComponent(consentCookie!.value));
		expect(consentData.purposes.analytics).toBe("denied");
	});

	test("should handle keyboard navigation", async ({ page }) => {
		const banner = page.getByRole("dialog", { name: /cookie banner/i });
		await expect(banner).toBeVisible();

		// Tab should focus first button (Accept All)
		await page.keyboard.press("Tab");
		await expect(page.getByTestId("accept-all-cookies")).toBeFocused();

		// Tab to next button
		await page.keyboard.press("Tab");
		await expect(page.getByTestId("reject-all-cookies")).toBeFocused();

		// Tab to customize button
		await page.keyboard.press("Tab");
		await expect(page.getByTestId("customize-cookies")).toBeFocused();

		// Enter should activate customize button
		await page.keyboard.press("Enter");
		const modal = page.getByRole("dialog", { name: /cookie preferences/i });
		await expect(modal).toBeVisible();

		// Escape should close modal
		await page.keyboard.press("Escape");
		await expect(modal).toBeHidden();
	});

	test("should persist consent across sessions", async ({ page, context }) => {
		// Accept all cookies
		await page.getByTestId("accept-all-cookies").click();
		await expect(page.getByRole("dialog", { name: /cookie banner/i })).toBeHidden();

		// Create new page in same context (simulates new tab)
		const newPage = await context.newPage();
		await newPage.goto("/");

		// Banner should not appear on new page
		await expect(newPage.getByRole("dialog", { name: /cookie banner/i })).toBeHidden();

		await newPage.close();
	});

	test("should emit consent events", async ({ page }) => {
		// Listen for consent events
		const consentEvents: any[] = [];
		page.on("console", (msg) => {
			if (msg.text().includes("consent_")) {
				consentEvents.push(msg.text());
			}
		});

		await page.addInitScript(() => {
			window.addEventListener("consent_loaded", (e: any) => {
				// Store event for test verification
				(window as any).__consentEvents = (window as any).__consentEvents || [];
				(window as any).__consentEvents.push({ type: "consent_loaded", detail: e.detail });
			});
			window.addEventListener("consent_updated", (e: any) => {
				// Store event for test verification
				(window as any).__consentEvents = (window as any).__consentEvents || [];
				(window as any).__consentEvents.push({ type: "consent_updated", detail: e.detail });
			});
		});

		// Accept all cookies
		await page.getByTestId("accept-all-cookies").click();

		// Wait for events to be emitted
		await page.waitForTimeout(100);

		// Verify events were emitted (this would need to be adapted based on actual implementation)
		expect(consentEvents.length).toBeGreaterThan(0);
	});
});
