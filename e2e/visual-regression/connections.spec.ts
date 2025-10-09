import { expect, test } from "e2e/fixtures";

test.describe("Connections Page Visual Regression", () => {
	let projectId: string;

	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		const url = page.url();
		const match = url.match(/\/projects\/([^/]+)/);
		projectId = match ? match[1] : "";
		await page.goto(`/projects/${projectId}/connections`);
		await page.waitForLoadState("networkidle");
	});

	test("Connections list page - displays integration icons", async ({ page }) => {
		await expect(page).toHaveScreenshot("connections-integrations-list.png", {
			fullPage: true,
			mask: [page.locator('[data-testid="dynamic-content"]')],
		});
	});

	test("Add connection form - integration select dropdown open", async ({ page }) => {
		await page.goto(`/projects/${projectId}/connections/add`);
		await page.waitForSelector("form", { timeout: 10000 });

		const integrationSelect = page.getByTestId("select-integration");

		if (await integrationSelect.isVisible()) {
			await integrationSelect.click();
			await page.waitForTimeout(300);

			await expect(page).toHaveScreenshot("connections-integration-select-open.png", {
				fullPage: false,
			});
		}
	});

	test("Add connection form - filled with Twilio and API Key connection type", async ({ page }) => {
		await page.goto(`/projects/${projectId}/connections/add`);
		await page.waitForSelector("form", { timeout: 10000 });

		const nameInput = page.getByTestId("connection-name-input");
		if (await nameInput.isVisible()) {
			await nameInput.fill("My Twilio Connection");
		}

		const integrationSelect = page.getByTestId("select-integration");
		if (await integrationSelect.isVisible()) {
			await integrationSelect.click();
			await page.waitForTimeout(200);
			await page.getByText("Twilio", { exact: true }).click();
			await page.waitForTimeout(300);
		}

		const connectionTypeSelect = page.getByTestId("select-connection-type");
		if (await connectionTypeSelect.isVisible()) {
			await connectionTypeSelect.click();
			await page.waitForTimeout(200);
			await page.getByText("API Key", { exact: true }).click();
			await page.waitForTimeout(300);
		}

		await expect(page).toHaveScreenshot("connections-add-form-twilio-apikey.png", {
			fullPage: true,
			mask: [page.locator('[data-testid="dynamic-content"]')],
		});
	});

	test("Add connection form - partially filled with validation errors", async ({ page }) => {
		await page.goto(`/projects/${projectId}/connections/add`);
		await page.waitForSelector("form", { timeout: 10000 });

		const nameInput = page.getByTestId("connection-name-input");
		if (await nameInput.isVisible()) {
			await nameInput.fill("Incomplete Connection");
		}

		const integrationSelect = page.getByTestId("select-integration");
		if (await integrationSelect.isVisible()) {
			await integrationSelect.click();
			await page.waitForTimeout(200);
			await page.getByText("Twilio", { exact: true }).click();
			await page.waitForTimeout(300);
		}

		const connectionTypeSelect = page.getByTestId("select-connection-type");
		if (await connectionTypeSelect.isVisible()) {
			await connectionTypeSelect.click();
			await page.waitForTimeout(200);
			await page.getByText("API Key", { exact: true }).click();
			await page.waitForTimeout(300);
		}

		const submitButton = page.getByRole("button", { name: "Save Connection" });
		if (await submitButton.isVisible()) {
			await submitButton.click();
			await page.waitForTimeout(500);
		}

		await expect(page).toHaveScreenshot("connections-add-form-validation-errors.png", {
			fullPage: true,
			mask: [page.locator('[data-testid="dynamic-content"]')],
		});
	});
});
