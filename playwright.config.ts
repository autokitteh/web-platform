import { PlaywrightTestOptions, defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

const visualRegression = process.env.DOCKER_VISUAL_REGRESSION === "true";

dotenv.config();

const extraHTTPHeaders: PlaywrightTestOptions["extraHTTPHeaders"] | undefined = process.env.TESTS_JWT_AUTH_TOKEN
	? { Authorization: `Bearer ${process.env.TESTS_JWT_AUTH_TOKEN}` }
	: {};

const previewPort = process.env.VITE_PREVIEW_PORT
	? parseInt(process.env.VITE_PREVIEW_PORT)
	: process.env.VITE_LOCAL_PORT
		? parseInt(process.env.VITE_LOCAL_PORT)
		: 8000;

const snapshotDir = process.env.SNAPSHOT_DIR;

const getSnapshotPath = (): string => {
	if (snapshotDir) {
		const absoluteSnapshotDir = path.isAbsolute(snapshotDir)
			? snapshotDir
			: path.resolve(process.cwd(), snapshotDir);

		return `${absoluteSnapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}`;
	}

	return "{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}";
};

const visualRegressionConfig = {
	browserName: "chromium" as const,
	timezoneId: "UTC",
	locale: "en-US",
	colorScheme: "light" as const,
	reducedMotion: "reduce" as const,
	video: "on" as const,
	trace: "on" as const,
	screenshot: "on" as const,
	launchOptions: {
		args: [
			"--disable-gpu",
			"--disable-dev-shm-usage",
			"--disable-accelerated-2d-canvas",
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--font-render-hinting=none",
			"--disable-lcd-text",
			"--disable-font-subpixel-positioning",
		],
	},
	...devices["Desktop Chrome"],
};

export default defineConfig({
	forbidOnly: !!process.env.CI,
	workers: 1,

	projects: [
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
			use: visualRegressionConfig,
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
			maxDiffPixels: 500,
			maxDiffPixelRatio: 0.05,
			threshold: 0.3,
			animations: "disabled",
		},
	},

	snapshotPathTemplate: getSnapshotPath(),

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
		command: "npm run dev",
		url: "http://127.0.0.1:8000",
		reuseExistingServer: !process.env.CI,
		stderr: "pipe",
		stdout: "pipe",
		timeout: visualRegression ? 5 * 60 * 1000 : 2 * 60 * 1000, // 120,000 ms = 2 minutes (build can take time in Docker)
	},
});
