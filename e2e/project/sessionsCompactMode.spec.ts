import type { APIRequestContext, Page } from "@playwright/test";

import { expect, test } from "../fixtures";
import { WebhookSessionPage } from "e2e/pages";

interface SetupParams {
	page: Page;
	request: APIRequestContext;
}

test.describe("Sessions Table Compact Mode Suite", () => {
	test.beforeEach(async ({ page, request }: SetupParams) => {
		const webhookSessionPage = new WebhookSessionPage(page, request);
		await webhookSessionPage.setupProjectAndTriggerSession();
	});

	test("Should display trigger icons when sessions table is in compact mode", async ({ page }) => {
		test.setTimeout(5 * 60 * 1000);

		const sessionsButton = page.locator('button[aria-label="Sessions"]');
		await sessionsButton.click();

		await page.waitForTimeout(2000);

		const sessionsTableFrame = page.locator("#sessions-table");
		await expect(sessionsTableFrame).toBeVisible();

		const resizeButton = page.locator("#sessions-table-resize-button");
		await expect(resizeButton).toBeVisible();

		const resizeButtonBox = await resizeButton.boundingBox();
		if (!resizeButtonBox) {
			throw new Error("Resize button not found");
		}

		const viewportSize = page.viewportSize();
		if (!viewportSize) {
			throw new Error("Viewport size not available");
		}

		const targetX = viewportSize.width * 0.22;

		await page.mouse.move(
			resizeButtonBox.x + resizeButtonBox.width / 2,
			resizeButtonBox.y + resizeButtonBox.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(targetX, resizeButtonBox.y + resizeButtonBox.height / 2);
		await page.mouse.up();

		await page.waitForTimeout(500);

		const startTimeCell = sessionsTableFrame.locator('td[aria-label^="Session "]').first();
		const infoButtons = startTimeCell.locator('button[aria-label^="Additional information session"]');
		const hasIcon = await infoButtons.count();
		expect(hasIcon).toBeGreaterThan(0);
	});

	test("Should display text when sessions table is not in compact mode", async ({ page }) => {
		test.setTimeout(5 * 60 * 1000);

		const sessionsButton = page.locator('button[aria-label="Sessions"]');
		await sessionsButton.click();

		await page.waitForTimeout(2000);

		const sessionsTableFrame = page.locator("#sessions-table");
		await expect(sessionsTableFrame).toBeVisible();

		const resizeButton = page.locator("#sessions-table-resize-button");
		await expect(resizeButton).toBeVisible();

		const resizeButtonBox = await resizeButton.boundingBox();
		if (!resizeButtonBox) {
			throw new Error("Resize button not found");
		}

		const viewportSize = page.viewportSize();
		if (!viewportSize) {
			throw new Error("Viewport size not available");
		}

		const targetX = viewportSize.width * 0.5;

		await page.mouse.move(
			resizeButtonBox.x + resizeButtonBox.width / 2,
			resizeButtonBox.y + resizeButtonBox.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(targetX, resizeButtonBox.y + resizeButtonBox.height / 2);
		await page.mouse.up();

		await page.waitForTimeout(500);

		const sourceColumnCell = sessionsTableFrame.locator('td[aria-label^="Session "]').first();
		const cellText = await sourceColumnCell.textContent();

		expect(cellText).toBeTruthy();
		expect(cellText?.trim().length).toBeGreaterThan(0);
	});

	test("Should toggle between icon and text when resizing", async ({ page }) => {
		test.setTimeout(5 * 60 * 1000);

		const sessionsButton = page.locator('button[aria-label="Sessions"]');
		await sessionsButton.click();

		await page.waitForTimeout(2000);

		const sessionsTableFrame = page.locator("#sessions-table");
		await expect(sessionsTableFrame).toBeVisible();

		const resizeButton = page.locator("#sessions-table-resize-button");
		await expect(resizeButton).toBeVisible();

		const resizeButtonBox = await resizeButton.boundingBox();
		if (!resizeButtonBox) {
			throw new Error("Resize button not found");
		}

		const viewportSize = page.viewportSize();
		if (!viewportSize) {
			throw new Error("Viewport size not available");
		}

		const wideTargetX = viewportSize.width * 0.5;
		await page.mouse.move(
			resizeButtonBox.x + resizeButtonBox.width / 2,
			resizeButtonBox.y + resizeButtonBox.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(wideTargetX, resizeButtonBox.y + resizeButtonBox.height / 2);
		await page.mouse.up();

		await page.waitForTimeout(500);

		const sourceColumnCell = sessionsTableFrame.locator('td[aria-label^="Session "]').first();
		const initialText = await sourceColumnCell.textContent();
		expect(initialText?.trim().length).toBeGreaterThan(0);

		const newResizeButtonBox = await resizeButton.boundingBox();
		if (!newResizeButtonBox) {
			throw new Error("Resize button not found after first resize");
		}

		const narrowTargetX = viewportSize.width * 0.15;
		await page.mouse.move(
			newResizeButtonBox.x + newResizeButtonBox.width / 2,
			newResizeButtonBox.y + newResizeButtonBox.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(narrowTargetX, newResizeButtonBox.y + newResizeButtonBox.height / 2);
		await page.mouse.up();

		await page.waitForTimeout(500);

		const hasIcon = await sourceColumnCell.locator('button[aria-label^="Additional information session"]').count();
		expect(hasIcon).toBeGreaterThan(0);
	});

	test("Should persist compact mode setting after navigation", async ({ page }) => {
		test.setTimeout(5 * 60 * 1000);

		const sessionsButton = page.locator('button[aria-label="Sessions"]');
		await sessionsButton.click();

		await page.waitForTimeout(2000);

		const sessionsTableFrame = page.locator("#sessions-table");
		await expect(sessionsTableFrame).toBeVisible();

		const resizeButton = page.locator("#sessions-table-resize-button");
		await expect(resizeButton).toBeVisible();

		const resizeButtonBox = await resizeButton.boundingBox();
		if (!resizeButtonBox) {
			throw new Error("Resize button not found");
		}

		const viewportSize = page.viewportSize();
		if (!viewportSize) {
			throw new Error("Viewport size not available");
		}

		const targetX = viewportSize.width * 0.15;

		await page.mouse.move(
			resizeButtonBox.x + resizeButtonBox.width / 2,
			resizeButtonBox.y + resizeButtonBox.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(targetX, resizeButtonBox.y + resizeButtonBox.height / 2);
		await page.mouse.up();

		await page.waitForTimeout(500);

		let sourceColumnCell = sessionsTableFrame.locator('td[aria-label^="Session "]').first();
		const hasIconBefore = await sourceColumnCell
			.locator('button[aria-label^="Additional information session"]')
			.count();
		expect(hasIconBefore).toBeGreaterThan(0);

		const deploymentsButton = page.locator('button[aria-label="Deployments"]');
		await deploymentsButton.click();
		await page.waitForTimeout(500);

		await sessionsButton.click();
		await page.waitForTimeout(500);

		sourceColumnCell = sessionsTableFrame.locator('td[aria-label^="Session "]').first();
		const hasIconAfter = await sourceColumnCell
			.locator('button[aria-label^="Additional information session"]')
			.count();
		expect(hasIconAfter).toBeGreaterThan(0);
	});

	test("Should display Webhook icon for webhook sessions in compact mode", async ({ page }) => {
		test.setTimeout(5 * 60 * 1000);

		const sessionsButton = page.locator('button[aria-label="Sessions"]');
		await sessionsButton.click();

		await page.waitForTimeout(2000);

		const sessionsTableFrame = page.locator("#sessions-table");
		await expect(sessionsTableFrame).toBeVisible();

		const resizeButton = page.locator("#sessions-table-resize-button");
		await expect(resizeButton).toBeVisible();

		const resizeButtonBox = await resizeButton.boundingBox();
		if (!resizeButtonBox) {
			throw new Error("Resize button not found");
		}

		const viewportSize = page.viewportSize();
		if (!viewportSize) {
			throw new Error("Viewport size not available");
		}

		const targetX = viewportSize.width * 0.15;

		await page.mouse.move(
			resizeButtonBox.x + resizeButtonBox.width / 2,
			resizeButtonBox.y + resizeButtonBox.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(targetX, resizeButtonBox.y + resizeButtonBox.height / 2);
		await page.mouse.up();

		await page.waitForTimeout(500);

		const iconButton = sessionsTableFrame
			.locator('td[aria-label^="Session "] button[aria-label^="Additional information session"]')
			.first();
		const icon = iconButton.locator("svg").first();

		await expect(iconButton).toBeVisible();

		const iconClass = await icon.getAttribute("class");
		expect(iconClass).toContain("h-4 w-4");
	});
});
