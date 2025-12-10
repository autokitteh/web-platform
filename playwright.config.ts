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

const previewPort = process.env.VITE_PREVIEW_PORT
	? parseInt(process.env.VITE_PREVIEW_PORT)
	: process.env.VITE_LOCAL_PORT
		? parseInt(process.env.VITE_LOCAL_PORT)
		: 8000;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,

	workers: 1,

	/* Configure projects for major browsers */
	projects: [
		// {
		// 	name: "chromium",
		// 	use: { ...devices["Desktop Chrome"] },
		// },

		{
			name: "Firefox",
			use: { ...devices["Desktop Firefox"] },
			testIgnore: /.*\.visual\.spec\.ts/,
		},

		{
			name: "Safari",
			use: { ...devices["Desktop Safari"] },
			testIgnore: /.*\.visual\.spec\.ts/,
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
			testIgnore: /.*\.visual\.spec\.ts/,
		},
		{
			name: "Chrome",
			use: { ...devices["Desktop Chrome"], channel: "chrome" },
			testIgnore: /.*\.visual\.spec\.ts/,
		},
		{
			name: "Visual Regression",
			testMatch: /.*\.visual\.spec\.ts/,
			use: {
				...devices["Desktop Chrome"],
				channel: "chrome",
			},
		},
	],

	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		["html", { open: "never", outputFolder: "playwright-report" }],
		["list", { printSteps: true }],
		["@estruyf/github-actions-reporter", { useDetails: true, showError: true }],
		["json", { outputFile: "test-results/results.json" }],
	],

	testDir: "e2e",

	timeout: 60 * 1000 * 2.5, // 2.5 minutes timeout for each test

	retries: process.env.CI ? 2 : 0, // 2 retries for CI, 0 for local

	/* Visual regression test settings */
	expect: {
		/* Maximum time to wait for assertion */
		timeout: 5000,
		/* Threshold for visual comparison (0-1, where 0 is exact match) */
		toHaveScreenshot: {
			maxDiffPixels: 100,
			maxDiffPixelRatio: 0.01,
			threshold: 0.3,
			animations: "disabled",
		},
	},

	/* Use platform-agnostic snapshot names */
	snapshotPathTemplate: "{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}",

	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: `http://localhost:${previewPort}`,

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: process.env.CI ? "retain-on-failure" : "off",
		video: { mode: process.env.CI ? "retain-on-failure" : "off" },
		screenshot: { mode: process.env.CI ? "only-on-failure" : "off", fullPage: true },
		extraHTTPHeaders: { ...extraHTTPHeaders },

		viewport: { width: 1920, height: 1080 },

		actionTimeout: 3000,
	},

	webServer: {
		command: `npm run build && npm run preview`,
		port: previewPort,
		reuseExistingServer: !process.env.CI,
		stderr: "pipe",
		stdout: "pipe",
		timeout: 2 * 60 * 1000, // 120,000 ms = 2 minutes
	},
});
