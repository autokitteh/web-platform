import randomatic from "randomatic";

import { test, expect } from "../fixtures";
import { DashboardPage } from "e2e/pages";
import { waitForLoadingOverlayGone } from "e2e/utils/waitForLoadingOverlayToDisappear";

const projectName = `test_${randomatic("Aa", 4)}`;

test.describe("Events Suite", () => {
	test("Create new event from template: HTTP", async ({ page, request }) => {
		await waitForLoadingOverlayGone(page);
		const dashboardPage = new DashboardPage(page);
		await dashboardPage.createProjectFromTemplate(projectName);

		await page.getByRole("tab", { name: "Triggers" }).click();
		await page.getByLabel("Modify receive_http_get_or_head").click();

		await expect(page.getByLabel("Webhook URL")).toHaveValue(/https?:\/\//);
		const webhookUrl = await page.getByLabel("Webhook URL").inputValue();
		await request.get(webhookUrl, {
			timeout: 5000,
		});

		await page.getByLabel("Events").click();
		await page.getByLabel("Project name").click();
		await page.getByRole("option", { name: projectName }).click();
		await page.locator("body").click({ position: { x: 0, y: 0 } });

		await expect(page.getByRole("rowgroup").getByRole("row")).toHaveCount(2);
	});
});
