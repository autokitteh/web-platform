import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config();
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Add global timeout for entire test run */
	globalTimeout: 30 * 60 * 1000, // 30 minutes

	/* Global setup and teardown */
	globalSetup: "./e2e/global-setup.ts",
	globalTeardown: "./e2e/global-teardown.ts",

	/* Configure projects for major browsers */
	projects: [
		{
			name: "chrome",
			use: { ...devices["Desktop Chrome"], channel: "chrome" },
			// Full visual suite - all tests
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
			// Critical visual tests only
			testMatch: ["**/visual/**/*.spec.ts", "**/auth/**/*.spec.ts", "**/pages/*.spec.ts"],
		},
		{
			name: "safari",
			use: { ...devices["Desktop Safari"] },
			// Critical visual tests only
			testMatch: ["**/visual/**/*.spec.ts", "**/auth/**/*.spec.ts", "**/pages/*.spec.ts"],
		},
	],

	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		["html", { open: "never" }],
		["list", { printSteps: true }],
		["@estruyf/github-actions-reporter", { useDetails: true, showError: true }],
	],

	/* Retry on CI only */
	retries: process.env.CI ? 3 : 0,

	testDir: "e2e",

	timeout: 60 * 1000 * 3, // 3 minutes timeout for each test

	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: "http://localhost:8000",

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on",
		video: "on",
		screenshot: "on",
		extraHTTPHeaders: {
			Authorization: `Bearer ${process.env.TESTS_JWT_AUTH_TOKEN}`,
		},
		/* Visual regression testing settings */
		ignoreHTTPSErrors: true,
		locale: "en-US",
		timezoneId: "America/New_York",
	},

	/* Visual comparison settings */
	expect: {
		/* Screenshot comparison threshold */
		toHaveScreenshot: {
			threshold: 0.15,
			animations: "disabled",
		},
		/* Maximum allowed pixel difference for visual comparisons */
		toMatchSnapshot: {
			threshold: 0.15,
		},
	},

	webServer: {
		command: process.env.NODE_ENV === "development" ? "npm run dev" : "npm run build && npm run preview",
		port: 8000,
		reuseExistingServer: true,
		stderr: "pipe",
		stdout: "pipe",
		timeout: 120000,
	},
});
