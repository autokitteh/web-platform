/* eslint-disable unicorn/filename-case, @typescript-eslint/no-unused-vars, no-console */
import { FullConfig } from "@playwright/test";

async function globalTeardown(_config: FullConfig) {
	console.log("🧹 Cleaning up after Playwright tests");

	// Optional cleanup logic here
	return undefined;
}

export default globalTeardown;
