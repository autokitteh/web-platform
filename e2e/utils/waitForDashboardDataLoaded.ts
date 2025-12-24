import { expect, type Page } from "@playwright/test";

export const waitForDashboardDataLoaded = async (page: Page, timeout = 10000) => {
	const systemOverview = page.locator('section[aria-label="System overview"]');
	await expect(systemOverview.getByText("Projects").first()).toBeVisible({ timeout });
};

export const waitForRefreshButtonEnabled = async (page: Page, timeout = 10000) => {
	const refreshButton = page.getByRole("button", { name: "Refresh dashboard" });
	await expect(refreshButton).toBeEnabled({ timeout });
	return refreshButton;
};
