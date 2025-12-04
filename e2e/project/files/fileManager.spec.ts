import { expect, test } from "e2e/fixtures";
import { waitForToast } from "e2e/utils";

test.describe("File Manager Suite", () => {
	test.beforeEach(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		await expect(page.getByRole("button", { name: "Open program.py" })).toBeVisible();
	});

	test.describe("File Operations", () => {
		test("Create new file", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new file" }).click();

			const nameInput = page.getByLabel("New file name");
			await nameInput.waitFor({ state: "visible" });
			await nameInput.fill("test.py");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			await expect(page.getByRole("button", { name: "Open test.py" })).toBeVisible();
			await expect(page.getByRole("tab", { name: "test.py" })).toBeVisible();
		});

		test("Rename file via edit button", async ({ page }) => {
			const fileNode = page.locator('button[aria-label="Open program.py"]');
			await fileNode.hover();

			await page.locator('div[aria-label="Rename file program.py"]').click();

			const input = fileNode.locator("input");
			await input.fill("edited.py");
			await input.press("Enter");

			await expect(page.getByRole("button", { name: "Open edited.py" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Open program.py" })).not.toBeVisible();
		});

		test("Rename file validation - empty name", async ({ page }) => {
			const fileNode = page.locator('button[aria-label="Open program.py"]');
			await fileNode.hover();

			await page.locator('div[aria-label="Rename file program.py"]').click();

			const input = fileNode.locator("input");
			await input.fill("");
			await input.press("Enter");

			await expect(fileNode.getByText("Name cannot be empty")).toBeVisible();
		});

		test("Rename file validation - invalid characters", async ({ page }) => {
			const fileNode = page.locator('button[aria-label="Open program.py"]');
			await fileNode.hover();

			await page.locator('div[aria-label="Rename file program.py"]').click();

			const input = fileNode.locator("input");
			await input.fill("test/file.py");
			await input.press("Enter");

			await expect(fileNode.getByText("Name contains invalid characters")).toBeVisible();
		});

		test("Rename file validation - leading/trailing spaces", async ({ page }) => {
			const fileNode = page.locator('button[aria-label="Open program.py"]');
			await fileNode.hover();

			await page.locator('div[aria-label="Rename file program.py"]').click();

			const input = fileNode.locator("input");
			await input.fill(" test.py ");
			await input.press("Enter");

			await expect(fileNode.getByText("Name cannot have leading or trailing spaces")).toBeVisible();
		});

		test("Cancel rename with Escape", async ({ page }) => {
			const fileNode = page.locator('button[aria-label="Open program.py"]');
			await fileNode.hover();

			await page.locator('div[aria-label="Rename file program.py"]').click();

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

		test("Rename file in subdirectory preserves path", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByRole("textbox", { name: "New directory name" });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("subdir");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			await waitForToast(page, 'Directory "subdir" created successfully');

			const directory = page.getByRole("button", { name: "Open subdir", exact: true });
			await directory.click();

			directory.hover();
			const addFileButton = page.locator('div[aria-label="Add file to subdir"]');
			await expect(addFileButton).toBeVisible();
			await addFileButton.click();

			const nameInput = page.getByLabel("New file name");
			await nameInput.waitFor({ state: "visible" });
			await nameInput.fill("nested.py");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			const nestedFile = page.getByRole("button", { name: "Open subdir/nested.py", exact: true });
			await expect(nestedFile).toBeVisible();

			await nestedFile.hover();

			await page.locator('div[aria-label="Rename file subdir/nested.py"]').click();

			const input = nestedFile.locator("input");
			await input.fill("renamed.py");
			await input.press("Enter");

			const toast = await waitForToast(page, "File renamed successfully");
			await expect(toast).toBeVisible();

			await expect(page.getByRole("button", { name: "Open subdir/renamed.py" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Open subdir/nested.py" })).not.toBeVisible();

			await directory.click();

			await expect(page.getByRole("button", { name: "Open subdir/renamed.py" })).not.toBeVisible();
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
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);

			const directoryNameInput = page.getByRole("textbox", { name: "New directory name" });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("test_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			const toast = await waitForToast(page, 'Directory "test_dir" created successfully');
			await expect(toast).toBeVisible();

			await expect(page.locator('button:has-text("test_dir")').first()).toBeVisible();
		});

		test("Directory validation - empty name", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);

			await page.getByRole("button", { name: "Create", exact: true }).click();

			await expect(page.getByText("Directory Name is required")).toBeVisible();
		});

		test("Directory validation - starts with dot", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);

			const directoryNameInput = page.getByRole("textbox", { name: "New directory name" });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill(".hidden");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			await expect(page.getByText("Directory Name cannot start with a dot")).toBeVisible();
		});

		test("Rename directory and cancel with Escape", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByRole("textbox", { name: "New directory name" });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("old_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			await waitForToast(page, 'Directory "old_dir" created successfully');

			const dirNode = page.locator('button:has-text("old_dir")');
			expect(dirNode).toBeVisible();
			expect(dirNode).toHaveCount(1);
			await dirNode.click();
			await dirNode.hover();
			await dirNode.locator('div[aria-label="Rename directory old_dir"]').click();

			const input = page.getByPlaceholder("Rename directory old_dir");
			expect(input).toBeVisible();
			expect(input).toHaveCount(1);
			await input.fill("new_dir");
			await page.keyboard.press("Escape");

			await expect(page.locator('button:has-text("new_dir")')).not.toBeVisible();
			await expect(page.locator('button:has-text("old_dir")')).toBeVisible();
		});

		test("Rename directory and confirm with Enter", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByRole("textbox", { name: "New directory name" });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("old_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			await waitForToast(page, 'Directory "old_dir" created successfully');

			const dirNode = page.locator('button:has-text("old_dir")');
			expect(dirNode).toBeVisible();
			expect(dirNode).toHaveCount(1);
			await dirNode.click();
			await dirNode.hover();
			await dirNode.locator('div[aria-label="Rename directory old_dir"]').click();

			const input = page.getByPlaceholder("Rename directory old_dir");
			expect(input).toBeVisible();
			expect(input).toHaveCount(1);
			await input.fill("new_dir");
			await page.keyboard.press("Enter");

			await waitForToast(page, "Directory renamed successfully");

			await expect(page.locator('button:has-text("new_dir")')).toBeVisible();
			await expect(page.locator('button:has-text("old_dir")')).not.toBeVisible();
		});

		test("Delete directory", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByRole("textbox", { name: "New directory name" });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("temp_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			await waitForToast(page, 'Directory "temp_dir" created successfully');

			const dirNode = page.locator('button:has-text("temp_dir")').first();
			await dirNode.hover();

			await page.locator('div[aria-label="Delete directory temp_dir"]').click();
			await page.getByRole("button", { name: "Ok", exact: true }).click();

			const toast = await waitForToast(page, 'Directory "temp_dir" deleted successfully');
			await expect(toast).toBeVisible();

			await expect(page.locator('button:has-text("temp_dir")')).not.toBeVisible();
		});

		test("Expand and collapse directory", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByRole("textbox", { name: "New directory name" });
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

		test("Expand and collapse directory with files", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByRole("textbox", { name: "New directory name" });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("parent_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			await waitForToast(page, 'Directory "parent_dir" created successfully');

			const dirNode = page.locator('button:has-text("parent_dir")').first();
			await dirNode.click();
			dirNode.hover();
			await page.locator('div[aria-label="Add file to parent_dir"]').click();

			const nameInput = page.getByLabel("New file name");
			await nameInput.waitFor({ state: "visible" });
			await nameInput.fill("nested_file.py");
			await page.getByRole("button", { name: "Create", exact: true }).click();

			const chevron = dirNode.locator("svg").first();

			await expect(chevron).toHaveClass(/rotate-90/);
			await expect(page.getByRole("button", { name: "Open parent_dir/nested_file.py" })).toBeVisible();

			await dirNode.click();
			await expect(chevron).toHaveClass(/rotate-0/);
			await expect(page.getByRole("button", { name: "Open parent_dir/nested_file.py" })).not.toBeVisible();
		});
	});

	test.describe("Search Functionality", () => {
		test.beforeEach(async ({ page }) => {
			await page.getByRole("button", { name: "Create new file or directory" }).click();
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
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByRole("textbox", { name: "New directory name" });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("target_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();
			await waitForToast(page, 'Directory "target_dir" created successfully');
			const targetDir = page.getByRole("button", { name: "Open target_dir", exact: true });
			await expect(targetDir).toBeVisible();
		});

		test("Move file into directory", async ({ page }) => {
			const file = page.locator('button[aria-label="Open program.py"]');
			const directory = page.locator('button:has-text("target_dir")').first();

			await file.dragTo(directory);

			const toast = await waitForToast(page, "File moved successfully");
			await expect(toast).toBeVisible();

			await expect(page.getByRole("button", { name: "Open target_dir/program.py" })).toBeVisible();
			await expect(
				page.getByRole("tab", { name: "target_dir/program.py Close file tab", exact: true })
			).toBeVisible();
		});

		test("Move directory into another directory", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new directory" }).click();
			await page.mouse.move(0, 0);
			const directoryNameInput = page.getByRole("textbox", { name: "New directory name" });
			await directoryNameInput.waitFor({ state: "visible" });
			await directoryNameInput.fill("nested_dir");
			await page.getByRole("button", { name: "Create", exact: true }).click();
			await waitForToast(page, 'Directory "nested_dir" created successfully');

			const targetDir = page.getByRole("button", { name: "Open target_dir", exact: true });

			const sourceDir = page.getByRole("button", { name: "Open nested_dir", exact: true });

			await sourceDir.dragTo(targetDir);

			const toast = await waitForToast(page, "Directory moved successfully");
			await expect(toast).toBeVisible();

			await expect(page.getByRole("button", { name: "Open target_dir/nested_dir", exact: true })).toBeVisible();
			await targetDir.click();
			await expect(
				page.getByRole("button", { name: "Open target_dir/nested_dir", exact: true })
			).not.toBeVisible();
		});

		test("Move file to root", async ({ page, browserName }) => {
			test.skip(browserName === "webkit", "Skip Safari");

			const closeDirCreationToast = page.getByRole("button", {
				name: 'Close "Success Directory "target_dir" created successfully" toast',
			});
			expect(closeDirCreationToast).toBeVisible();
			await closeDirCreationToast.click();

			const directory = page.getByRole("button", { name: "Open target_dir", exact: true });
			await directory.click();

			await directory.hover();
			const addFileButton = directory.locator('div[aria-label="Add file to target_dir"]');
			await expect(addFileButton).toBeVisible();
			await addFileButton.click();

			const nameInput = page.getByLabel("New file name");
			await nameInput.waitFor({ state: "visible" });
			await nameInput.fill("nested_file.py");
			await page.getByRole("button", { name: "Create", exact: true }).click();
			await expect(page.getByRole("button", { name: "Open target_dir/nested_file.py" })).toBeVisible();
			await expect(page.getByRole("heading", { name: "Create File", exact: true })).not.toBeVisible();

			const file = page.getByRole("button", { name: "Open target_dir/nested_file.py", exact: true });
			const programFile = page.locator('button[aria-label="Open program.py"]');

			const fileBox = await file.boundingBox();
			const programBox = await programFile.boundingBox();

			if (fileBox && programBox) {
				await page.mouse.move(fileBox.x + fileBox.width / 2, fileBox.y + fileBox.height / 2);
				await page.mouse.down();
				await page.waitForTimeout(500);
				await page.mouse.move(programBox.x + 50, programBox.y + programBox.height - 10, { steps: 3 });
				await page.waitForTimeout(1500);
				await page.mouse.up();
			}

			const toast = await waitForToast(page, "File moved successfully");
			await expect(toast).toBeVisible();
			await expect(page.getByRole("button", { name: "Open nested_file.py" })).toBeVisible();
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
	});

	test.describe("Empty State", () => {
		test("Display empty state message", async ({ dashboardPage, page }) => {
			await dashboardPage.createProjectFromMenu();

			const file = page.locator('button[aria-label="Open program.py"]');
			await file.hover();
			await page.locator('div[aria-label="Delete file program.py"]').hover();
			await page.locator('div[aria-label="Delete file program.py"]').click();
			await page.getByRole("button", { name: "Ok", exact: true }).click();
			await waitForToast(page, 'File "program.py" deleted successfully');

			await expect(page.getByText("No files available")).toBeVisible();
		});
	});

	test.describe("File Selection and Active State", () => {
		test("File becomes active when clicked", async ({ page }) => {
			const file = page.locator('button[aria-label="Open program.py"]');
			await file.click();

			await expect(page.getByRole("tab", { name: "program.py Close file tab" })).toBeVisible();

			const fileButton = page.locator('button[aria-label="Open program.py"]');
			await expect(fileButton).toHaveClass(/bg-gray-1250/);
		});

		test("Multiple files can be opened", async ({ page }) => {
			await page.getByRole("button", { name: "Create new file or directory" }).click();
			await page.getByRole("button", { name: "Create new file" }).click();
			const nameInput = page.getByLabel("New file name");
			await nameInput.waitFor({ state: "visible" });
			await nameInput.fill("second.py");
			await page.getByRole("button", { name: "Create", exact: true }).click();
			await expect(page.getByRole("button", { name: "Open second.py" })).toBeVisible();

			await page.locator('button[aria-label="Open program.py"]').click();
			await page.locator('button[aria-label="Open second.py"]').click();

			await expect(page.getByRole("tab", { name: "program.py Close file tab" })).toBeVisible();
			await expect(page.getByRole("tab", { name: "second.py Close file tab" })).toBeVisible();
		});
	});
});
