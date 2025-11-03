#!/usr/bin/env node
/* eslint-disable no-console, no-undef */
import { execSync } from "child_process";
import fs from "fs";

const getNoConsoleViolations = (filePath) => {
	try {
		execSync(`npx eslint ${filePath}`, { encoding: "utf8" });
		return [];
	} catch (error) {
		const output = error.stdout || "";
		const violations = [];
		const lines = output.split("\n");

		for (const line of lines) {
			const match = line.match(/^\s*(\d+):\d+\s+error\s+Unexpected console statement\s+no-console/);
			if (match) {
				violations.push(parseInt(match[1], 10));
			}
		}

		return violations;
	}
};

const removeConsoleLogsFromLines = (content, lineNumbers) => {
	if (lineNumbers.length === 0) {
		return content;
	}

	const lines = content.split("\n");
	const lineSet = new Set(lineNumbers);
	let modified = false;

	for (let i = 0; i < lines.length; i++) {
		const lineNum = i + 1;
		if (lineSet.has(lineNum)) {
			const originalLine = lines[i];
			lines[i] = lines[i].replace(/console\.log\s*\([^)]*\);?/g, "");
			if (lines[i] !== originalLine) {
				modified = true;
			}
			if (lines[i].trim() === "") {
				lines[i] = "";
			}
		}
	}

	if (!modified) {
		return content;
	}

	let result = lines.join("\n");
	result = result.replace(/\n\s*\n\s*\n/g, "\n\n");

	return result;
};

const processFile = (filePath) => {
	try {
		const violations = getNoConsoleViolations(filePath);

		if (violations.length === 0) {
			return false;
		}

		const content = fs.readFileSync(filePath, "utf8");
		const newContent = removeConsoleLogsFromLines(content, violations);

		if (content !== newContent) {
			fs.writeFileSync(filePath, newContent, "utf8");
			console.log(`Removed console.log from: ${filePath}`);
			return true;
		}

		return false;
	} catch (error) {
		console.error(`Error processing ${filePath}:`, error.message);
		return false;
	}
};

const main = () => {
	const files = process.argv.slice(2);
	if (files.length === 0) {
		return;
	}

	let modifiedCount = 0;
	files.forEach((file) => {
		if (processFile(file)) {
			modifiedCount++;
		}
	});

	if (modifiedCount > 0) {
		console.log(`✅ Removed console.log from ${modifiedCount} file(s)`);
	}
};

main();
