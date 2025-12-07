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

		const resizeButton = page.locator('[data-testid="split-frame-resize-button"]');
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

		const splitFrame = page.locator("#project-split-frame");
		await expect(splitFrame).toBeVisible();

		const splitFrameBoxBefore = await splitFrame.boundingBox();
		if (!splitFrameBoxBefore) {
			throw new Error("Split frame not found");
		}

		const resizeButton = page.locator('[data-testid="split-frame-resize-button"]');
		await expect(resizeButton).toBeVisible();
		const resizeButtonBox = await resizeButton.boundingBox();
		if (!resizeButtonBox) {
			throw new Error("Resize button not found");
		}
		const initialPercentage = ((resizeButtonBox.x - splitFrameBoxBefore.x) / splitFrameBoxBefore.width) * 100;
		await page.mouse.move(
			resizeButtonBox.x + resizeButtonBox.width / 2,
			resizeButtonBox.y + resizeButtonBox.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(resizeButtonBox.x + 100, resizeButtonBox.y + resizeButtonBox.height / 2);
		await page.mouse.up();

		const resizedButtonBox = await resizeButton.boundingBox();
		if (!resizedButtonBox) {
			throw new Error("Resize button not found after drag");
		}

		const resizedPercentage = ((resizedButtonBox.x - splitFrameBoxBefore.x) / splitFrameBoxBefore.width) * 100;
		expect(Math.abs(resizedPercentage - initialPercentage)).toBeGreaterThan(2);

		await page.waitForTimeout(500);

		const deploymentsTab = page.getByRole("button", { name: "Deployments" });
		await deploymentsTab.click();
		await page.waitForTimeout(500);

		const explorerTab = page.getByRole("button", { name: "Explorer" });
		await explorerTab.waitFor({ state: "visible" });
		await explorerTab.click();

		const resizeButtonAfterNav = page.locator('[data-testid="split-frame-resize-button"]');
		await expect(resizeButtonAfterNav).toBeVisible();

		const resizeButtonBoxAfterNav = await resizeButtonAfterNav.boundingBox();
		if (!resizeButtonBoxAfterNav) {
			throw new Error("Resize button not found after navigation");
		}

		const splitFrameBoxAfterNav = await splitFrame.boundingBox();
		if (!splitFrameBoxAfterNav) {
			throw new Error("Split frame not found after navigation");
		}

		const resizePercentageAfterNav =
			((resizeButtonBoxAfterNav.x - splitFrameBoxAfterNav.x) / splitFrameBoxAfterNav.width) * 100;
		expect(Math.abs(resizePercentageAfterNav - resizedPercentage)).toBeLessThan(0.5);
	});

	test("Should create and display file in project files", async ({ page }) => {
		const filesHeading = page.getByRole("heading", { name: "Files", exact: true });
		await expect(filesHeading).toBeVisible();

		const projectFilesTreeContainer = page.locator('[data-testid="project-files-tree-container"]');
		await expect(projectFilesTreeContainer).toBeVisible();
		await page.getByRole("button", { name: "Create new file or directory" }).click();
		await page.getByRole("button", { name: "Create new file" }).click();

		const nameInput = page.getByLabel("New file name");
		await nameInput.waitFor({ state: "visible" });
		await nameInput.fill("testFile.py");
		await page.getByRole("button", { name: "Create", exact: true }).click();

		await page.waitForTimeout(1000);

		const fileInTree = projectFilesTreeContainer.getByText("testFile.py");
		await expect(fileInTree).toBeVisible();
	});

	test("Should adjust split width when multiple files are added", async ({ page }) => {
		const filesHeading = page.getByRole("heading", { name: "Files", exact: true });
		await expect(filesHeading).toBeVisible();

		const resizeButton = page.locator('[data-testid="split-frame-resize-button"]');
		await expect(resizeButton).toBeVisible();

		const initialBox = await resizeButton.boundingBox();
		if (!initialBox) {
			throw new Error("Resize button not found");
		}

		await page.getByRole("button", { name: "Create new file or directory" }).click();
		await page.getByRole("button", { name: "Create new file" }).click();

		const nameInput = page.getByLabel("New file name");
		await nameInput.waitFor({ state: "visible" });
		await nameInput.fill("veryLongFileNameThatShouldAdjustTheWidth.py");
		await page.getByRole("button", { name: "Create", exact: true }).click();

		await page.waitForTimeout(1000);

		await expect(page.getByRole("tab", { name: "veryLongFileNameThatShouldAdjustTheWidth.py" })).toBeVisible();

		await expect(
			page.getByRole("button", { name: "Open veryLongFileNameThatShouldAdjustTheWidth.py", exact: true })
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Delete file veryLongFileNameThatShouldAdjustTheWidth.py", exact: true })
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Rename file veryLongFileNameThatShouldAdjustTheWidth.py", exact: true })
		).toBeVisible();

		await page.waitForTimeout(500);

		const resizeButtonAfter = page.locator('[data-testid="split-frame-resize-button"]');
		const boxAfter = await resizeButtonAfter.boundingBox();

		if (boxAfter) {
			expect(boxAfter.x).toBeGreaterThanOrEqual(initialBox.x);
		}
	});
});
