import { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
	console.log("🧹 Cleaning up after Playwright tests");

	// Optional cleanup logic here
	return undefined;
}

export default globalTeardown;
