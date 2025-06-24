#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

class PlaywrightMCPServer {
	private server: Server;
	private projectRoot: string;

	constructor() {
		this.server = new Server(
			{
				name: "playwright-mcp-server",
				version: "1.0.0",
			},
			{
				capabilities: {
					tools: {},
				},
			}
		);

		this.projectRoot = process.cwd();
		this.setupHandlers();
	}

	private sanitizeFilePath(filePath: string): string {
		// Resolve and normalize the path to prevent path traversal
		const resolvedPath = path.resolve(this.projectRoot, filePath);

		// Ensure the resolved path is within the project root
		if (!resolvedPath.startsWith(path.resolve(this.projectRoot))) {
			throw new Error("Access denied: Path outside project root");
		}

		return resolvedPath;
	}

	private safeFileExists(filePath: string): boolean {
		try {
			const safePath = this.sanitizeFilePath(filePath);
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			return fs.existsSync(safePath);
		} catch {
			return false;
		}
	}

	private safeReadFile(filePath: string, encoding: BufferEncoding = "utf-8"): string {
		const safePath = this.sanitizeFilePath(filePath);
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		return fs.readFileSync(safePath, encoding);
	}

	private setupHandlers() {
		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools: [
				{
					name: "analyze_playwright_test",
					description: "Analyze a Playwright test file for issues and provide fixes",
					inputSchema: {
						type: "object",
						properties: {
							testFile: {
								type: "string",
								description: "Path to the Playwright test file to analyze",
							},
						},
						required: ["testFile"],
					},
				},
				{
					name: "run_playwright_tests",
					description: "Run Playwright tests and return results",
					inputSchema: {
						type: "object",
						properties: {
							testFile: {
								type: "string",
								description: "Specific test file to run (optional)",
							},
							grep: {
								type: "string",
								description: "Pattern to filter tests (optional)",
							},
						},
					},
				},
				{
					name: "fix_playwright_test",
					description: "Suggest fixes for common Playwright test issues",
					inputSchema: {
						type: "object",
						properties: {
							testFile: {
								type: "string",
								description: "Path to the test file to fix",
							},
							issue: {
								type: "string",
								description: "Description of the issue to fix",
							},
						},
						required: ["testFile", "issue"],
					},
				},
				{
					name: "generate_playwright_test",
					description: "Generate a new Playwright test based on requirements",
					inputSchema: {
						type: "object",
						properties: {
							testName: {
								type: "string",
								description: "Name for the new test",
							},
							description: {
								type: "string",
								description: "Description of what the test should do",
							},
							pageUrl: {
								type: "string",
								description: "URL to test (optional)",
							},
						},
						required: ["testName", "description"],
					},
				},
			],
		}));

		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			switch (request.params.name) {
				case "analyze_playwright_test":
					return await this.analyzeTest(request.params.arguments);
				case "run_playwright_tests":
					return await this.runTests(request.params.arguments);
				case "fix_playwright_test":
					return await this.fixTest(request.params.arguments);
				case "generate_playwright_test":
					return await this.generateTest(request.params.arguments);
				default:
					throw new Error(`Unknown tool: ${request.params.name}`);
			}
		});
	}

	private async analyzeTest(args: any) {
		const { testFile } = args;

		if (!this.safeFileExists(testFile)) {
			return {
				content: [
					{
						type: "text",
						text: `Test file not found: ${testFile}`,
					},
				],
			};
		}

		try {
			const content = this.safeReadFile(testFile);
			const issues = this.findTestIssues(content);

			return {
				content: [
					{
						type: "text",
						text: `Analysis of ${testFile}:\n\n${issues.join("\n")}`,
					},
				],
			};
		} catch (error: any) {
			return {
				content: [
					{
						type: "text",
						text: `Error reading test file: ${error.message}`,
					},
				],
			};
		}
	}

	private async runTests(args: any): Promise<{ content: Array<{ text: string; type: string }> }> {
		const { testFile, grep } = args;

		try {
			const command = ["playwright", "test"];

			if (testFile) {
				command.push(testFile);
			}

			if (grep) {
				command.push("--grep", grep);
			}

			command.push("--reporter=json");

			return await new Promise<{ content: Array<{ text: string; type: string }> }>((resolve, reject) => {
				const process = spawn("npx", command, {
					cwd: this.projectRoot,
					stdio: ["pipe", "pipe", "pipe"],
				});

				let stdout = "";
				let stderr = "";

				process.stdout.on("data", (data) => {
					stdout += data.toString();
				});

				process.stderr.on("data", (data) => {
					stderr += data.toString();
				});

				process.on("close", (code) => {
					if (code !== 0 && code !== 1) {
						// 1 is acceptable for failed tests
						reject(new Error(`Process exited with code ${code}: ${stderr}`));
						return;
					}

					try {
						const result = JSON.parse(stdout);
						resolve({
							content: [
								{
									type: "text",
									text: `Test Results:\n${this.formatTestResults(result)}`,
								},
							],
						});
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
					} catch (parseError) {
						resolve({
							content: [
								{
									type: "text",
									text: `Test completed but failed to parse results:\n${stdout}\n\nError: ${stderr}`,
								},
							],
						});
					}
				});

				process.on("error", (error) => {
					reject(error);
				});

				// Set a timeout to kill the process if it runs too long
				const timeout = setTimeout(() => {
					if (!process.killed) {
						process.kill("SIGTERM");
						// Force kill after 5 seconds if SIGTERM doesn't work
						setTimeout(() => {
							if (!process.killed) {
								process.kill("SIGKILL");
							}
						}, 5000);
						reject(new Error("Test execution timed out after 5 minutes"));
					}
				}, 300000); // 5 minutes

				// Clear timeout when process completes
				process.on("close", () => {
					clearTimeout(timeout);
				});
			});
		} catch (error: any) {
			return {
				content: [
					{
						type: "text",
						text: `Error running tests: ${error.message}`,
					},
				],
			};
		}
	}

	private async fixTest(args: any) {
		const { testFile, issue } = args;

		if (!this.safeFileExists(testFile)) {
			return {
				content: [
					{
						type: "text",
						text: `Test file not found: ${testFile}`,
					},
				],
			};
		}

		try {
			const content = this.safeReadFile(testFile);
			const fixes = this.generateFixes(content, issue);

			return {
				content: [
					{
						type: "text",
						text: `Suggested fixes for ${testFile}:\n\n${fixes}`,
					},
				],
			};
		} catch (error: any) {
			return {
				content: [
					{
						type: "text",
						text: `Error reading test file: ${error.message}`,
					},
				],
			};
		}
	}

	private async generateTest(args: any) {
		const { testName, description, pageUrl } = args;

		const template = this.generateTestTemplate(testName, description, pageUrl);

		return {
			content: [
				{
					type: "text",
					text: `Generated test:\n\n\`\`\`typescript\n${template}\n\`\`\``,
				},
			],
		};
	}

	private findTestIssues(content: string): string[] {
		const issues: string[] = [];

		// Check for common issues
		if (!content.includes("await expect(")) {
			issues.push("⚠️  Consider using await expect() for better async handling");
		}

		if (content.includes(".click()") && !content.includes("await")) {
			issues.push("⚠️  Missing await before .click() actions");
		}

		if (!content.includes("test.describe")) {
			issues.push("💡 Consider grouping related tests with test.describe()");
		}

		if (content.includes("page.waitForTimeout")) {
			issues.push("⚠️  Consider using waitForSelector() instead of waitForTimeout()");
		}

		if (!content.includes("test.beforeEach") && content.split("test(").length > 2) {
			issues.push("💡 Multiple tests detected - consider using beforeEach for setup");
		}

		// Check for selectors that might be brittle
		const textSelectors = content.match(/getByText\(['"](.*?)['"]\)/g);
		if (textSelectors && textSelectors.length > 3) {
			issues.push("💡 Many text-based selectors found - consider using data-testid attributes");
		}

		return issues.length > 0 ? issues : ["✅ No major issues found!"];
	}

	private generateFixes(content: string, issue: string): string {
		const fixes: string[] = [];

		if (issue.toLowerCase().includes("timeout") || issue.toLowerCase().includes("wait")) {
			fixes.push(`
// Replace waitForTimeout with more reliable waits:
// Bad:
await page.waitForTimeout(5000);

// Good:
await page.waitForSelector('[data-testid="element"]');
await expect(page.getByTestId('element')).toBeVisible();
            `);
		}

		if (issue.toLowerCase().includes("selector") || issue.toLowerCase().includes("element")) {
			fixes.push(`
// Use more reliable selectors:
// Bad:
page.getByText('exact text')

// Good:
page.getByTestId('element-id')
page.getByRole('button', { name: /submit/i })
            `);
		}

		if (issue.toLowerCase().includes("flaky") || issue.toLowerCase().includes("unstable")) {
			fixes.push(`
// Make tests more stable:
1. Use explicit waits: await expect(element).toBeVisible()
2. Use retry logic with toPass()
3. Add proper test isolation with beforeEach cleanup
4. Use page.waitForLoadState('networkidle') for dynamic content
            `);
		}

		return fixes.join("\n\n");
	}

	private generateTestTemplate(testName: string, description: string, pageUrl?: string): string {
		return `import { test, expect } from '@playwright/test';

test.describe('${testName}', () => {
    test.beforeEach(async ({ page }) => {
        // Setup before each test
        ${pageUrl ? `await page.goto('${pageUrl}');` : "// Navigate to your page"}
    });

    test('${description}', async ({ page }) => {
        // Test implementation
        ${pageUrl ? `await page.goto('${pageUrl}');` : "// Add your test steps here"}
        
        // Example assertions
        await expect(page).toHaveTitle(/expected title/);
        await expect(page.getByTestId('some-element')).toBeVisible();
        
        // Add your test logic here
    });
});`;
	}

	private formatTestResults(result: any): string {
		const stats = result.stats || {};
		const tests = result.tests || [];

		let output = `Passed: ${stats.passed || 0}, Failed: ${stats.failed || 0}, Skipped: ${stats.skipped || 0}\n\n`;

		const failedTests = tests.filter((test: any) => test.outcome === "failed");
		if (failedTests.length > 0) {
			output += "Failed Tests:\n";
			failedTests.forEach((test: any) => {
				output += `- ${test.title}: ${test.error?.message || "Unknown error"}\n`;
			});
		}

		return output;
	}

	async start() {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		// Server started successfully - no logging needed for production
	}
}

const server = new PlaywrightMCPServer();
server.start().catch((error) => {
	process.stderr.write(`Error starting server: ${error.message}\n`);
	process.exit(1);
});
