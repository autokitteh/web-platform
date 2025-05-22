import type { Page } from "@playwright/test";

export const waitForMonacoEditorToLoad = async (page: Page, timeout = 5000) => {
	await page.waitForSelector(".monaco-editor .view-lines", { timeout });
	await page.getByText('print("Meow, World!")').waitFor({ timeout: 8000 });
};

export const waitForMonacoEditorContent = async (page: Page, expectedContent: string, timeout = 10000) => {
	await waitForMonacoEditorToLoad(page, timeout);

	await page.waitForFunction(
		(content) => {
			return document.body.textContent?.includes(content) || false;
		},
		expectedContent,
		{ timeout: Math.min(timeout, 8000) }
	);
};
