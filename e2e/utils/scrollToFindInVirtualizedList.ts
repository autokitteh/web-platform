import { expect, Locator, Page } from "@playwright/test";

interface ScrollToFindOptions {
	maxAttempts?: number;
	scrollAmount?: number;
	waitBetweenScrolls?: number;
	visibilityTimeout?: number;
}

export async function scrollToFindInVirtualizedList(
	page: Page,
	scrollContainer: Locator,
	targetElement: Locator,
	options: ScrollToFindOptions = {}
): Promise<void> {
	const { maxAttempts = 50, scrollAmount = 200, waitBetweenScrolls = 100, visibilityTimeout = 7000 } = options;

	await scrollContainer.waitFor({ state: "visible" });

	await scrollContainer.evaluate((el) => {
		el.scrollTop = 0;
	});
	await page.waitForTimeout(waitBetweenScrolls);

	if (await targetElement.isVisible()) {
		await expect(targetElement).toBeVisible({ timeout: visibilityTimeout });

		return;
	}

	let attempts = 0;

	while (!(await targetElement.isVisible()) && attempts < maxAttempts) {
		await scrollContainer.evaluate((el, amount) => {
			el.scrollTop += amount;
		}, scrollAmount);
		await page.waitForTimeout(waitBetweenScrolls);
		attempts++;
	}

	await expect(targetElement).toBeVisible({ timeout: visibilityTimeout });
}

export function getProjectsTableScrollContainer(page: Page): Locator {
	return page.getByTestId("projects-table-scroll-container");
}

export function getProjectRowLocator(page: Page, projectName: string): Locator {
	const projectsSection = page.getByRole("region", { name: "Projects" });
	return projectsSection.getByText(projectName);
}
