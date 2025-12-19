import { expect, test } from "../fixtures";
import { initialPillsCount } from "@constants/pages/aiWelcomePage.constants";

test.describe("AI Chat and Iframe Communication Suite", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/ai");
		await page.waitForLoadState("networkidle");
	});

	test("AI landing page loads correctly with all elements", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /Build AI Agents/i })).toBeVisible();
		await expect(page.getByRole("heading", { name: /Create workflows/i })).toBeVisible();

		await expect(page.getByRole("button", { name: "Start from Template" })).toBeVisible();
		await expect(page.getByRole("button", { name: "New Project From Scratch" })).toBeVisible();

		const textarea = page.locator('textarea[name="message"]');
		await expect(textarea).toBeVisible();
	});

	test("Suggestion pills are visible and clickable", async ({ page }) => {
		const pills = page.locator("button[data-testid^='suggestion-pill-']");
		await expect(pills.first()).toBeVisible();

		await pills.first().click();

		const textarea = page.locator('textarea[name="message"]');
		await expect(textarea).toBeFocused();
	});

	test("More button loads additional suggestion pills", async ({ page }) => {
		const initialPills = page.locator("button[data-testid^='suggestion-pill-']");
		await expect(initialPills.first()).toBeVisible({ timeout: 10000 });
		await expect(initialPills).toHaveCount(initialPillsCount, { timeout: 10000 });

		const initialPillsTitles: string[] = [];
		for (let i = 0; i < initialPillsCount; i++) {
			const pillText = await initialPills.nth(i).textContent();
			if (pillText) {
				initialPillsTitles.push(pillText.trim());
			}
		}

		expect(initialPillsTitles).toHaveLength(initialPillsCount);
		expect(initialPillsTitles.every((title) => title && title.length > 0)).toBe(true);

		const moreButton = page.getByRole("button", { name: "More", exact: true });
		if (await moreButton.isVisible()) {
			await moreButton.click();

			await page.waitForTimeout(300);

			const allVisiblePills = page.locator("button[data-testid^='suggestion-pill-']");
			const allPillsCount = await allVisiblePills.count();
			expect(allPillsCount).toBeGreaterThan(initialPillsCount);

			const allPillsTitles: string[] = [];
			for (let i = 0; i < allPillsCount; i++) {
				const pillText = await allVisiblePills.nth(i).textContent();
				if (pillText) {
					allPillsTitles.push(pillText.trim());
				}
			}

			expect(allPillsTitles).toHaveLength(allPillsCount);
			expect(allPillsTitles.every((title) => title && title.length > 0)).toBe(true);

			const initialPillsFromExpanded = allPillsTitles.slice(0, initialPillsCount);
			expect(initialPillsFromExpanded).toEqual(initialPillsTitles);

			await expect(moreButton).not.toBeVisible();
		}
	});

	test("Submit message opens AI chat modal", async ({ page }) => {
		const textarea = page.locator('textarea[name="message"]');
		await textarea.fill("Create a GitHub webhook automation");

		await page.keyboard.press("Enter");

		const modal = page.locator('[class*="modal"], [role="dialog"], [data-testid="ai-chat-modal"]');
		await expect(modal.first()).toBeVisible({ timeout: 10000 });
	});

	test("Empty message shows validation error", async ({ page }) => {
		const textarea = page.locator('textarea[name="message"]');
		await textarea.focus();
		await page.keyboard.press("Enter");

		const errorMessage = page.getByText("Please enter a message");
		await expect(errorMessage).toBeVisible({ timeout: 5000 });
	});

	test("Textarea clears validation error when typing", async ({ page }) => {
		const textarea = page.locator('textarea[name="message"]');
		await textarea.focus();
		await page.keyboard.press("Enter");

		const errorMessage = page.getByText("Please enter a message");
		await expect(errorMessage).toBeVisible({ timeout: 5000 });

		await textarea.fill("Test message");

		await expect(errorMessage).not.toBeVisible({ timeout: 3000 });
	});

	test("Navigation buttons work correctly", async ({ page }) => {
		const templateButton = page.getByRole("button", { name: "Start from Template" });
		await templateButton.click();
		await expect(page).toHaveURL(/templates-library/);

		await page.goto("/ai");

		const learnMoreButton = page.getByRole("button", { name: /Learn more/i });
		if (await learnMoreButton.isVisible()) {
			await learnMoreButton.click();
			await expect(page).toHaveURL(/intro/);
		}
	});
});

test.describe("AI Chat Modal Iframe Behavior", () => {
	test("Modal can be closed", async ({ page }) => {
		await page.goto("/ai");
		await page.waitForLoadState("networkidle");

		const textarea = page.locator('textarea[name="message"]');
		await textarea.fill("Test automation");
		await page.keyboard.press("Enter");

		const modal = page.locator('[class*="modal"], [role="dialog"]');
		await expect(modal.first()).toBeVisible({ timeout: 10000 });

		const closeButton = page.locator(
			'[aria-label*="close" i], [class*="close"], button:has-text("×"), button:has-text("Close")'
		);
		if (await closeButton.first().isVisible()) {
			await closeButton.first().click();
			await expect(modal.first()).not.toBeVisible({ timeout: 5000 });
		} else {
			await page.keyboard.press("Escape");
			await page.waitForTimeout(500);
		}
	});
});
