#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let argIndex = 2;
const playwrightArgs = [];

if (process.argv[2] === "--") {
	argIndex = 3;
}

while (argIndex < process.argv.length && process.argv[argIndex].startsWith("--")) {
	playwrightArgs.push(process.argv[argIndex]);
	argIndex++;
}

const testName = process.argv[argIndex];

if (!testName) {
	console.error("Error: Test name is required");
	console.error('Usage: npm run test:e2e:by-name -- [playwright-args] "test name"');
	process.exit(1);
}

const e2eDir = path.join(__dirname, "..", "e2e", "project");

if (!fs.existsSync(e2eDir)) {
	console.error(`Error: E2E directory not found at ${e2eDir}`);
	process.exit(1);
}

function searchTestsInDirectory(dir, testPattern) {
	const results = [];

	function walk(currentPath) {
		const entries = fs.readdirSync(currentPath, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(currentPath, entry.name);

			if (entry.isDirectory()) {
				walk(fullPath);
			} else if (entry.isFile() && entry.name.endsWith(".spec.ts")) {
				const content = fs.readFileSync(fullPath, "utf-8");
				const testRegex = /test\(['"`]([^'"`]+)['"`]/g;
				let match;

				while ((match = testRegex.exec(content)) !== null) {
					const foundTestName = match[1];
					if (
						foundTestName.toLowerCase().includes(testPattern.toLowerCase()) ||
						testPattern.toLowerCase().includes(foundTestName.toLowerCase())
					) {
						results.push({
							file: fullPath,
							testName: foundTestName,
							relativePath: path.relative(e2eDir, fullPath),
						});
					}
				}
			}
		}
	}

	walk(dir);
	return results;
}

const matches = searchTestsInDirectory(e2eDir, testName);

if (matches.length === 0) {
	console.error(`Error: No test found matching "${testName}"`);
	console.error("");
	console.error("Available tests:");

	const allTests = [];
	function getAllTests(dir) {
		const entries = fs.readdirSync(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				getAllTests(fullPath);
			} else if (entry.isFile() && entry.name.endsWith(".spec.ts")) {
				const content = fs.readFileSync(fullPath, "utf-8");
				const testRegex = /test\(['"`]([^'"`]+)['"`]/g;
				let match;

				while ((match = testRegex.exec(content)) !== null) {
					allTests.push({
						file: path.relative(e2eDir, fullPath),
						testName: match[1],
					});
				}
			}
		}
	}

	getAllTests(e2eDir);
	allTests.forEach(({ file, testName: name }) => {
		console.error(`  ${name} (${file})`);
	});

	process.exit(1);
}

if (matches.length > 1) {
	console.warn(`Found ${matches.length} matching tests. Running all matches...\n`);
	matches.forEach(({ relativePath, testName: name }) => {
		console.warn(`  - ${name} (${relativePath})`);
	});
	console.warn("");
}

const testFiles = [...new Set(matches.map((m) => m.file))];
const filePattern = testFiles.map((f) => `"${f}"`).join(" ");
const additionalArgs = process.argv.slice(argIndex + 1).join(" ");
const allPlaywrightArgs = [...playwrightArgs, ...additionalArgs.split(" ").filter(Boolean)].join(" ");

try {
	const command = `npx playwright test ${filePattern} --grep "${matches.map((m) => m.testName).join("|")}"${allPlaywrightArgs ? ` ${allPlaywrightArgs}` : ""}`;
	console.log(`Running: ${command}\n`);
	execSync(command, { stdio: "inherit" });
} catch (error) {
	process.exit(error.status || 1);
}
