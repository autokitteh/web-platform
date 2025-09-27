import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
	// Set NODE_ENV for development mode
	process.env.NODE_ENV = "development";

	// Optional: Start dev server if not already running
	console.log("🚀 Setting up development environment for Playwright tests");

	return undefined;
}

export default globalSetup;
