import type { Locator, Page } from "@playwright/test";

const defaultTimeout = 5000;

const openSystemLog = async (page: Page): Promise<void> => {
	const systemLogButton = page.getByRole("button", { name: "System Log" });
	await systemLogButton.click();
};

export const findTextInSystemLog = async (
	page: Page,
	logText: string,
	options?: { timeout?: number }
): Promise<Locator> => {
	await openSystemLog(page);

	const logEntry = page.getByText(logText);
	await logEntry.waitFor({ state: "visible", timeout: options?.timeout ?? defaultTimeout });

	return logEntry;
};
