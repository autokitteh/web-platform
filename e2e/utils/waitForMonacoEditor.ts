import type { Page } from "@playwright/test";

export const waitForMonacoEditorToLoad = async (page: Page, timeout: number) => {
	await page.waitForSelector(".monaco-editor .view-lines", { timeout });
	await page.getByText('print("Meow, World!")').waitFor({ timeout });
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
