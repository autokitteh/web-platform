import { expect, test } from "e2e/fixtures";
import { waitForToast } from "e2e/utils";

test.describe("File Manager Suite", () => {
	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		await expect(page.getByRole("button", { name: "Open program.py" })).toBeVisible();
	});

	test.describe("File Operations", () => {
		test("Create new file", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file" }).click();

			const nameInput = page.getByLabel("New file name");
			await nameInput.waitFor({ state: "visible" });
			await nameInput.fill("test.py");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			await expect(page.getByRole("button", { name: "Open test.py" })).toBeVisible();
			await expect(page.getByRole("tab", { name: "test.py" })).toBeVisible();
		});

		test.skip("Rename file inline with F2", async ({ page }) => {
			const fileNode = page.locator('button[aria-label="Open program.py"]');
			await fileNode.click();

			await page.locator('[role="tree"]').first().press("F2");

			const input = fileNode.locator("input");
			await expect(input).toBeVisible();

			await input.fill("renamed.py");
			await input.press("Enter");

			const toast = await waitForToast(page, "File renamed successfully");
			await expect(toast).toBeVisible();

			await expect(page.getByRole("button", { name: "Open renamed.py" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Open program.py" })).not.toBeVisible();
		});

		test("Rename file via edit button", async ({ page }) => {
			const fileNode = page.locator('button[aria-label="Open program.py"]');
			await fileNode.hover();

			await page.locator('div[aria-label="Rename program.py"]').click();

			const input = fileNode.locator("input");
			await input.fill("edited.py");
			await input.press("Enter");

			await expect(page.getByRole("button", { name: "Open edited.py" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Open program.py" })).not.toBeVisible();
		});

		test("Rename file validation - empty name", async ({ page }) => {
			const fileNode = page.locator('button[aria-label="Open program.py"]');
			await fileNode.hover();

			await page.locator('div[aria-label="Rename program.py"]').click();

			const input = fileNode.locator("input");
			await input.fill("");
			await input.press("Enter");

			await expect(fileNode.getByText("Name cannot be empty")).toBeVisible();
		});

		test("Rename file validation - invalid characters", async ({ page }) => {
			const fileNode = page.locator('button[aria-label="Open program.py"]');
			await fileNode.hover();

			await page.locator('div[aria-label="Rename program.py"]').click();

			const input = fileNode.locator("input");
			await input.fill("test/file.py");
			await input.press("Enter");

			await expect(fileNode.getByText("Name contains invalid characters")).toBeVisible();
		});

		test("Rename file validation - leading/trailing spaces", async ({ page }) => {
			const fileNode = page.locator('button[aria-label="Open program.py"]');
			await fileNode.hover();

			await page.locator('div[aria-label="Rename program.py"]').click();

			const input = fileNode.locator("input");
			await input.fill(" test.py ");
			await input.press("Enter");

			await expect(fileNode.getByText("Name cannot have leading or trailing spaces")).toBeVisible();
		});

		test("Cancel rename with Escape", async ({ page }) => {
			const fileNode = page.locator('button[aria-label="Open program.py"]');
			await fileNode.hover();

			await page.locator('div[aria-label="Rename program.py"]').click();

			const input = fileNode.locator("input");
			await input.fill("cancelled.py");
			await input.press("Escape");

			await expect(input).not.toBeVisible();
			await expect(page.getByRole("button", { name: "Open program.py" })).toBeVisible();
		});

		test("Delete file", async ({ page }) => {
			await page.locator('button[data-testid="file-node-file-program.py"]').hover();
			await page.locator('div[aria-label="Delete file program.py"]').click();

			await page.getByRole("button", { name: "Ok", exact: true }).click();

			const toast = await waitForToast(page, 'File "program.py" deleted successfully');
			await expect(toast).toBeVisible();

			await expect(page.getByRole("button", { name: "Open program.py" })).not.toBeVisible();
		});

		test("Import file", async ({ page }) => {
			const fileInput = page.locator('input[type="file"]');
			const testFilePath = "e2e/fixtures/test-file.txt";

			await page.getByRole("button", { name: "Create new file" }).click();
			await fileInput.setInputFiles(testFilePath);

			const toast = await waitForToast(page, 'File "test-file.txt" imported successfully');
			await expect(toast).toBeVisible();
		});
	});

	test.describe("Directory Operations", () => {
		test("Create new directory", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file" }).click();
			await page.locator('button[aria-label="Create new directory"]').click();
			await page.mouse.move(0, 0);

			const directoryNameInput = page.getByLabel("Directory Name *", { exact: true });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("test_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			const toast = await waitForToast(page, 'Directory "test_dir" created successfully');
			await expect(toast).toBeVisible();

			await expect(page.locator('button:has-text("test_dir")').first()).toBeVisible();
		});

		test("Directory validation - empty name", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file" }).hover();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);

			await page.getByRole("button", { name: "Create", exact: true }).click();

			await expect(page.getByText("Directory Name is required")).toBeVisible();
		});

		test("Directory validation - starts with dot", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file" }).hover();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);

			const directoryNameInput = page.getByLabel("Directory Name *", { exact: true });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill(".hidden");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			await expect(page.getByText("Directory Name cannot start with a dot")).toBeVisible();
		});

		test("Rename directory", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file" }).hover();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByLabel("Directory Name *", { exact: true });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("old_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			await waitForToast(page, 'Directory "old_dir" created successfully');

			const dirNode = page.locator('button:has-text("old_dir")').first();
			await dirNode.click();
			await dirNode.press("F2");

			const input = dirNode.locator("input");
			await input.fill("new_dir");
			await input.press("Enter");

			const toast = await waitForToast(page, "Directory renamed successfully");
			await expect(toast).toBeVisible();

			await expect(page.locator('button:has-text("new_dir")').first()).toBeVisible();
		});

		test("Delete directory", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file" }).hover();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByLabel("Directory Name *", { exact: true });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("temp_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			await waitForToast(page, 'Directory "temp_dir" created successfully');

			const dirNode = page.locator('button:has-text("temp_dir")').first();
			await dirNode.hover();

			await page.locator('div[aria-label="Delete directory temp_dir"]').click();
			await page.getByRole("button", { name: "Delete", exact: true }).click();

			const toast = await waitForToast(page, "Directory deleted successfully");
			await expect(toast).toBeVisible();

			await expect(page.locator('button:has-text("temp_dir")')).not.toBeVisible();
		});

		test("Expand and collapse directory", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file" }).hover();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByLabel("Directory Name *", { exact: true });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("test_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			await waitForToast(page, 'Directory "test_dir" created successfully');

			const dirNode = page.locator('button:has-text("test_dir")').first();
			const chevron = dirNode.locator("svg").first();

			await expect(chevron).toHaveClass(/rotate-0/);

			await dirNode.click();
			await expect(chevron).toHaveClass(/rotate-90/);

			await dirNode.click();
			await expect(chevron).toHaveClass(/rotate-0/);
		});
	});

	test.describe("Search Functionality", () => {
		test.beforeEach(async ({ page }) => {
			await page.getByRole("button", { name: "Create new file" }).click();
			await page.getByLabel("New file name").fill("search_test.py");
			await page.getByRole("button", { name: "Create", exact: true }).click();
			await expect(page.getByRole("button", { name: "Open search_test.py" })).toBeVisible();
		});

		test("Search for file", async ({ page }) => {
			const searchInput = page.getByPlaceholder("Search files...");
			await searchInput.fill("search_test");

			await page.waitForTimeout(400);

			await expect(page.getByRole("button", { name: "Open search_test.py" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Open program.py" })).not.toBeVisible();
		});

		test("Search is debounced", async ({ page }) => {
			const searchInput = page.getByPlaceholder("Search files...");

			await searchInput.fill("s");
			await page.waitForTimeout(100);
			await searchInput.fill("se");
			await page.waitForTimeout(100);
			await searchInput.fill("sea");

			await expect(page.getByRole("button", { name: "Open program.py" })).toBeVisible();

			await page.waitForTimeout(350);

			await expect(page.getByRole("button", { name: "Open search_test.py" })).toBeVisible();
		});

		test("Clear search", async ({ page }) => {
			const searchInput = page.getByPlaceholder("Search files...");
			await searchInput.fill("search_test");
			await page.waitForTimeout(400);

			await expect(page.getByRole("button", { name: "Open program.py" })).not.toBeVisible();

			await searchInput.clear();
			await page.waitForTimeout(400);

			await expect(page.getByRole("button", { name: "Open program.py" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Open search_test.py" })).toBeVisible();
		});

		test("Search with no results", async ({ page }) => {
			const searchInput = page.getByPlaceholder("Search files...");
			await searchInput.fill("nonexistent");
			await page.waitForTimeout(400);

			await expect(page.getByRole("button", { name: "Open program.py" })).not.toBeVisible();
			await expect(page.getByRole("button", { name: "Open search_test.py" })).not.toBeVisible();
		});
	});

	test.describe("Drag and Drop Operations", () => {
		test.beforeEach(async ({ page }) => {
			await page.getByRole("button", { name: "Create new file" }).hover();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByLabel("Directory Name *", { exact: true });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("target_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();
			await waitForToast(page, 'Directory "target_dir" created successfully');
		});

		test("Move file into directory", async ({ page }) => {
			const file = page.locator('button[aria-label="Open program.py"]');
			const directory = page.locator('button:has-text("target_dir")').first();

			await file.dragTo(directory);

			const toast = await waitForToast(page, "File moved successfully");
			await expect(toast).toBeVisible();

			await directory.click();
			await expect(page.getByRole("button", { name: "Open program.py" })).toBeVisible();
		});

		test("Move directory into another directory", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file" }).click();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByLabel("Directory Name *", { exact: true });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("nested_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();
			await waitForToast(page, 'Directory "nested_dir" created successfully');

			const sourceDir = page.locator('button:has-text("nested_dir")').first();
			const targetDir = page.locator('button:has-text("target_dir")').first();

			await sourceDir.dragTo(targetDir);

			const toast = await waitForToast(page, "Directory moved successfully");
			await expect(toast).toBeVisible();

			await targetDir.click();
			await expect(page.locator('button:has-text("nested_dir")').first()).toBeVisible();
		});

		test("Cannot move into a file", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file" }).click();
			await page.getByLabel("New file name").fill("test2.py");
			await page.getByRole("button", { name: "Create", exact: true }).click();
			await expect(page.getByRole("button", { name: "Open test2.py" })).toBeVisible();

			const sourceFile = page.locator('button[aria-label="Open program.py"]');
			const targetFile = page.locator('button[aria-label="Open test2.py"]');

			await sourceFile.dragTo(targetFile);

			const toast = await waitForToast(page, "Cannot move into a file");
			await expect(toast).toBeVisible();
		});

		test("Move file to root", async ({ page }) => {
			const directory = page.locator('button:has-text("target_dir")').first();
			await directory.click();

			await page.getByRole("button", { name: "Create new file" }).click();
			await page.getByLabel("New file name").fill("nested_file.py");
			await page.getByRole("button", { name: "Create", exact: true }).click();
			await expect(page.getByRole("button", { name: "Open nested_file.py" })).toBeVisible();

			const file = page.locator('button[aria-label="Open nested_file.py"]');
			const rootArea = page.getByPlaceholder("Search files...");

			await file.dragTo(rootArea);

			const toast = await waitForToast(page, "File moved successfully");
			await expect(toast).toBeVisible();
		});
	});

	test.describe("Keyboard Navigation", () => {
		test("Navigate with arrow keys", async ({ page }) => {
			const firstFile = page.locator('button[aria-label="Open program.py"]');
			await firstFile.focus();

			await page.keyboard.press("ArrowDown");

			const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
			expect(focused).toBeTruthy();
		});

		test("Open file with Enter", async ({ page }) => {
			const file = page.locator('button[aria-label="Open program.py"]');
			await file.focus();
			await page.keyboard.press("Enter");

			await expect(page.getByRole("tab", { name: "program.py Close file tab" })).toBeVisible();
		});

		test("Rename with F2", async ({ page }) => {
			const file = page.locator('button[aria-label="Open program.py"]');
			await file.focus();
			await page.keyboard.press("F2");

			const input = file.locator("input");
			await expect(input).toBeVisible();
			await expect(input).toBeFocused();
		});

		test("Keyboard shortcuts popover displays on hover", async ({ page }) => {
			const searchInput = page.getByPlaceholder("Search files...");
			await searchInput.scrollIntoViewIfNeeded();

			const popoverTrigger = page.locator('[title="Keyboard shortcuts"]');
			await popoverTrigger.hover();

			await expect(page.getByText("Use arrow keys to navigate")).toBeVisible();
			await expect(page.getByText("Press Enter to open")).toBeVisible();
			await expect(page.getByText("Press F2 to rename")).toBeVisible();
		});
	});

	test.describe("Empty State", () => {
		test("Display empty state message", async ({ dashboardPage, page }) => {
			await dashboardPage.createProjectFromMenu();

			const file = page.locator('button[aria-label="Open program.py"]');
			await file.hover();
			await page.locator('div[aria-label="Delete file program.py"]').hover();
			await page.locator('div[aria-label="Delete file program.py"]').click();
			await page.getByRole("button", { name: "Delete", exact: true }).click();
			await waitForToast(page, "File deleted successfully");

			await expect(page.getByText("No files available")).toBeVisible();
		});
	});

	test.describe("File Selection and Active State", () => {
		test("File becomes active when clicked", async ({ page }) => {
			const file = page.locator('button[aria-label="Open program.py"]');
			await file.click();

			await expect(page.getByRole("tab", { name: "program.py Close file tab" })).toBeVisible();

			const fileButton = page.locator('button[aria-label="Open program.py"]');
			await expect(fileButton).toHaveClass(/bg-gray-1100/);
		});

		test("Multiple files can be opened", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file" }).click();
			await page.getByLabel("New file name").fill("second.py");
			await page.getByRole("button", { name: "Create", exact: true }).click();
			await expect(page.getByRole("button", { name: "Open second.py" })).toBeVisible();

			await page.locator('button[aria-label="Open program.py"]').click();
			await page.locator('button[aria-label="Open second.py"]').click();

			await expect(page.getByRole("tab", { name: "program.py Close file tab" })).toBeVisible();
			await expect(page.getByRole("tab", { name: "second.py Close file tab" })).toBeVisible();
		});
	});
});
