import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,

	/* Configure projects for major browsers */
	projects: [
		// {
		// 	name: "chromium",
		// 	use: { ...devices["Desktop Chrome"] },
		// },

		{
			name: "Firefox",
			use: { ...devices["Desktop Firefox"] },
		},

		{
			name: "Safari",
			use: { ...devices["Desktop Safari"] },
		},

		// {
		// 	name: "Mobile Chrome",
		// 	use: { ...devices["Pixel 5"] },
		// },
		// {
		// 	name: "Mobile Safari",
		// 	use: { ...devices["iPhone 12"] },
		// },

		{
			name: "Edge",
			use: { ...devices["Desktop Edge"], channel: "msedge" },
		},
		{
			name: "Chrome",
			use: { ...devices["Desktop Chrome"], channel: "chrome" },
		},
	],

	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		["html"],
		["list", { printSteps: true }],
		["@estruyf/github-actions-reporter", { useDetails: true, showError: true }],
	],

	/* Retry on CI only */
	retries: process.env.CI ? 3 : 0,

	testDir: "e2e",

	// test timeout set to 2 minutes

	timeout: 2 * 60 * 1000,

	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: "http://localhost:4173",

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on",
		video: "retain-on-failure",
	},

	webServer: {
		command: "npm run build && npm run preview",
		port: 4173,
		reuseExistingServer: !process.env.CI,
		stderr: "pipe",
		stdout: "pipe",
		timeout: 60000,
	},
});
