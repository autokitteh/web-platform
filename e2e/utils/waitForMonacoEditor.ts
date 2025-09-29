/* eslint-disable no-console */
import type { Page } from "@playwright/test";

export const waitForMonacoEditorToLoad = async (page: Page, timeout = 5000) => {
	await page.waitForSelector(".monaco-editor .view-lines", { timeout });
	try {
		await page.getByText('print("Meow, World!")').waitFor({ timeout: 8000 });
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_error) {
		try {
			await page.waitForSelector('.monaco-editor[data-uri*=".py"]', { timeout: 5000 });
		} catch {
			try {
				await page.waitForSelector(".monaco-editor .view-line", { timeout: 3000 });
			} catch {
				console.log("Monaco editor content not fully loaded, continuing...");
			}
		}
	}
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
