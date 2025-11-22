import type { APIRequestContext, Page } from "@playwright/test";

import { expect, test } from "../fixtures";
import { WebhookSessionPage } from "e2e/pages";

interface SetupParams {
	page: Page;
	request: APIRequestContext;
}

test.describe.skip("Sessions Table Compact Mode Suite", () => {
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

		const sessionTriggerTypeIconInSourceColumn = page.getByRole("img", {
			name: "webhook receive_http_get_or_head trigger icon",
			exact: true,
		});
		await expect(sessionTriggerTypeIconInSourceColumn).toBeVisible();
		const sessionTriggerTypeIconInStartTimeColumn = page.getByRole("img", {
			name: "webhook receive_http_get_or_head trigger",
			exact: true,
		});
		await expect(sessionTriggerTypeIconInStartTimeColumn).not.toBeVisible();

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

		const sessionTriggerNameCell = page.getByRole("cell", {
			name: "receive_http_get_or_head",
			exact: true,
		});
		await expect(sessionTriggerNameCell).not.toBeVisible();
		const sessionTriggerTypeIconInStartColumn = page.getByRole("img", {
			name: "webhook receive_http_get_or_head trigger",
			exact: true,
		});
		await expect(sessionTriggerTypeIconInStartColumn).toBeVisible();
	});

	test("Should display text when sessions table is not in compact mode", async ({ page }) => {
		test.setTimeout(5 * 60 * 1000);

		await page.getByRole("button", { name: "Sessions" }).click();

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

		const sessionTriggerNameCell = page.getByRole("cell", { name: "receive_http_get_or_head", exact: true });
		await expect(sessionTriggerNameCell).toBeVisible();
		const sessionTriggerTypeIcon = page.getByRole("img", { name: "webhook receive_http_get_or_head trigger icon" });

		await expect(sessionTriggerTypeIcon).toBeVisible();
	});

	test("Should toggle between icon and text when resizing", async ({ page }) => {
		test.setTimeout(5 * 60 * 1000);

		await page.getByRole("button", { name: "Sessions" }).click();

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

		const sessionTriggerNameCell = page.getByRole("cell", { name: "receive_http_get_or_head", exact: true });
		await expect(sessionTriggerNameCell).toBeVisible();

		const newResizeButtonBox = await resizeButton.boundingBox();
		if (!newResizeButtonBox) {
			throw new Error("Resize button not found after first resize");
		}

		const narrowTargetX = viewportSize.width * 0.2;
		await page.mouse.move(
			newResizeButtonBox.x + newResizeButtonBox.width / 2,
			newResizeButtonBox.y + newResizeButtonBox.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(narrowTargetX, newResizeButtonBox.y + newResizeButtonBox.height / 2);
		await page.mouse.up();

		await page.waitForTimeout(500);

		const sessionTriggerNameCellAfterResize = page.getByRole("img", {
			name: "webhook receive_http_get_or_head trigger",
			exact: true,
		});
		await expect(sessionTriggerNameCellAfterResize).toBeVisible();
		const hasIconInStartTimeColumn = page.getByRole("img", {
			name: "webhook receive_http_get_or_head trigger icon",
			exact: true,
		});
		await expect(hasIconInStartTimeColumn).not.toBeVisible();
	});
});
