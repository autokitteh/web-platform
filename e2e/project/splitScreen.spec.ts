import { expect, test } from "../fixtures";

test.describe("Split Screen Suite", () => {
	test.beforeEach(async ({ dashboardPage }) => {
		await dashboardPage.createProjectFromMenu();
	});

	test("Should show project files panel by default", async ({ page }) => {
		const filesHeading = page.getByRole("heading", { name: "Files", exact: true });
		await expect(filesHeading).toBeVisible();

		const hideFilesButton = page.locator('button[id="hide-project-files-button"]');
		await expect(hideFilesButton).toBeVisible();
	});

	test("Should hide project files panel when close button is clicked", async ({ page }) => {
		const filesHeading = page.getByRole("heading", { name: "Files", exact: true });
		await expect(filesHeading).toBeVisible();

		const hideFilesButton = page.locator('button[id="hide-project-files-button"]');
		await hideFilesButton.click();

		await expect(filesHeading).not.toBeVisible();

		const showFilesButton = page.locator('button[id="show-project-files-button"]');
		await expect(showFilesButton).toBeVisible();
	});

	test("Should be able to resize split screen", async ({ page }) => {
		const filesHeading = page.getByRole("heading", { name: "Files", exact: true });
		await expect(filesHeading).toBeVisible();

		const resizeButton = page.locator('[data-direction="horizontal"]').first();
		await expect(resizeButton).toBeVisible();

		const resizeButtonBox = await resizeButton.boundingBox();
		if (!resizeButtonBox) {
			throw new Error("Resize button not found");
		}

		await page.mouse.move(
			resizeButtonBox.x + resizeButtonBox.width / 2,
			resizeButtonBox.y + resizeButtonBox.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(resizeButtonBox.x + 100, resizeButtonBox.y + resizeButtonBox.height / 2);
		await page.mouse.up();

		await expect(filesHeading).toBeVisible();
	});

	test("Should persist split screen width after navigation", async ({ page }) => {
		const filesHeading = page.getByRole("heading", { name: "Files", exact: true });
		await expect(filesHeading).toBeVisible();

		const resizeButton = page.locator('[data-direction="horizontal"]').first();
		await expect(resizeButton).toBeVisible();

		const resizeButtonBox = await resizeButton.boundingBox();
		if (!resizeButtonBox) {
			throw new Error("Resize button not found");
		}

		const initialX = resizeButtonBox.x;

		await page.mouse.move(
			resizeButtonBox.x + resizeButtonBox.width / 2,
			resizeButtonBox.y + resizeButtonBox.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(resizeButtonBox.x + 100, resizeButtonBox.y + resizeButtonBox.height / 2);
		await page.mouse.up();

		await page.waitForTimeout(500);

		const deploymentsTab = page.getByRole("tab", { name: "deployments" });
		await deploymentsTab.click();
		await page.waitForTimeout(500);

		const explorerTab = page.getByRole("tab", { name: "explorer" });
		await explorerTab.click();
		await page.waitForTimeout(500);

		const resizeButtonAfterNav = page.locator('[data-direction="horizontal"]').first();
		await expect(resizeButtonAfterNav).toBeVisible();

		const resizeButtonBoxAfterNav = await resizeButtonAfterNav.boundingBox();
		if (!resizeButtonBoxAfterNav) {
			throw new Error("Resize button not found after navigation");
		}

		expect(Math.abs(resizeButtonBoxAfterNav.x - initialX)).toBeGreaterThan(50);
	});

	test("Should create and display file in project files", async ({ page }) => {
		const filesHeading = page.getByRole("heading", { name: "Files", exact: true });
		await expect(filesHeading).toBeVisible();

		await page.locator('button[aria-label="Create new file"]').click();
		await page.getByRole("textbox", { name: "new file name" }).click();
		await page.getByRole("textbox", { name: "new file name" }).fill("testFile.py");
		await page.getByRole("button", { name: "Create", exact: true }).click();

		await page.waitForTimeout(1000);

		const fileInTree = page.getByText("testFile.py");
		await expect(fileInTree).toBeVisible();
	});

	test("Should adjust split width when multiple files are added", async ({ page }) => {
		const filesHeading = page.getByRole("heading", { name: "Files", exact: true });
		await expect(filesHeading).toBeVisible();

		const resizeButton = page.locator('[data-direction="horizontal"]').first();
		await expect(resizeButton).toBeVisible();

		const initialBox = await resizeButton.boundingBox();
		if (!initialBox) {
			throw new Error("Resize button not found");
		}

		await page.locator('button[aria-label="Create new file"]').click();
		await page.getByRole("textbox", { name: "new file name" }).fill("veryLongFileNameThatShouldAdjustTheWidth.py");
		await page.getByRole("button", { name: "Create", exact: true }).click();

		await page.waitForTimeout(1000);

		const fileInTree = page.getByText("veryLongFileNameThatShouldAdjustTheWidth.py");
		await expect(fileInTree).toBeVisible();

		await page.waitForTimeout(500);

		const resizeButtonAfter = page.locator('[data-direction="horizontal"]').first();
		const boxAfter = await resizeButtonAfter.boundingBox();

		if (boxAfter) {
			expect(boxAfter.x).toBeGreaterThanOrEqual(initialBox.x);
		}
	});
});
