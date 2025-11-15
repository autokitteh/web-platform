import { PlaywrightTestOptions, defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

const extraHTTPHeaders: PlaywrightTestOptions["extraHTTPHeaders"] | undefined = process.env.TESTS_JWT_AUTH_TOKEN
	? { Authorization: `Bearer ${process.env.TESTS_JWT_AUTH_TOKEN}` }
	: {};

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
		["html", { open: "never" }],
		["list", { printSteps: true }],
		["@estruyf/github-actions-reporter", { useDetails: true, showError: true }],
	],

	testDir: "e2e",

	timeout: 60 * 1000 * 1.5, // 1.5 minutes timeout for each test

	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: "http://localhost:8000?e2e=true",

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on",
		video: "on",
		screenshot: "on",
		extraHTTPHeaders: { ...extraHTTPHeaders },
	},

	webServer: {
		command: "npm run build && npm run preview",
		port: 8000,
		reuseExistingServer: !process.env.CI,
		stderr: "pipe",
		stdout: "pipe",
		timeout: 120000,
	},
});
