import { expect, test } from "../fixtures";
import { waitForLoadingOverlayGone } from "e2e/utils/waitForLoadingOverlayToDisappear";

test.describe("Tour Suite", () => {
	test.beforeEach(async ({ page }) => {
		await waitForLoadingOverlayGone(page);
		await page.goto("/intro");
	});

	test("Onboarding tour - handle existing or create new", async ({ page }) => {
		const startButton = page.getByRole("button", { name: "Start the tour Onboarding" });

		await startButton.waitFor({ state: "attached" });
		const isStartButtonVisible = await startButton.isVisible();

		if (!isStartButtonVisible) {
			await page.goto("/");
			const deleteButton = page.getByRole("button", { name: "Delete project quickstart" });
			await deleteButton.click();
			await page
				.getByRole("button", { name: "Delete", exact: true })
				.or(page.getByRole("button", { name: "Ok" }))
				.click();
			await expect(deleteButton).toBeHidden();

			await page.goto("/intro");
			await expect(startButton).toBeVisible();
		}

		await startButton.click();
		await page.getByRole("button", { name: "Go to the next step" }).click();
		await page.getByRole("button", { name: "Deploy the project" }).click();
		await page.getByRole("button", { name: "Manual Run" }).click();
		await page.getByRole("button", { name: "View Sessions" }).click();
		await page.getByRole("button", { name: "Refresh Data" }).click();

		await expect(startButton).toBeHidden();
	});
});
