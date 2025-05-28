import { expect, test } from "../fixtures";
import { waitForLoadingOverlayGone } from "e2e/utils/waitForLoadingOverlayToDisappear";

test.describe("Dashboard Suite", () => {
	test("Template categories open and close popover", async ({ page }) => {
		await waitForLoadingOverlayGone(page);
		await page.goto("/intro");

		const categoriesButton = page.getByLabel("Categories");

		await expect(categoriesButton).toHaveAttribute("aria-expanded", "false");

		await categoriesButton.click();
		await expect(categoriesButton).toHaveAttribute("aria-expanded", "true");

		await page.locator("body").click({ position: { x: 0, y: 0 } });
		await expect(categoriesButton).toHaveAttribute("aria-expanded", "false");
	});

	test("Template category selection", async ({ page }) => {
		await waitForLoadingOverlayGone(page);
		await page.goto("/intro");

		const categoriesButton = page.getByLabel("Categories");

		await expect(categoriesButton).toHaveText("All");
		await categoriesButton.click();

		const samplesOption = page.getByRole("option", { name: "Samples" });
		const crmOption = page.getByRole("option", { name: "CRM" });

		await samplesOption.click();
		await expect(samplesOption).toHaveAttribute("aria-selected", "true");

		await crmOption.click();
		await expect(crmOption).toHaveAttribute("aria-selected", "true");

		await page.locator("body").click({ position: { x: 0, y: 0 } });
		await expect(categoriesButton).toHaveText("Samples, CRM");
	});
});
