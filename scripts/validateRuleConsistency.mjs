#!/usr/bin/env node
/* eslint-disable */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract rules from Go lint.go file
 * @param {string} goFilePath - Path to the Go lint file
 * @returns {Object} - Extracted rules object
 */
function extractRulesFromGoFile(goFilePath) {
	try {
		const content = fs.readFileSync(goFilePath, "utf8");

		// Find the Rules map using regex
		const rulesMatch = content.match(
			/var Rules = map\[string\]string\s*{\s*\/\/ ID -> Description\s*([\s\S]*?)\s*}/
		);

		if (!rulesMatch) {
			throw new Error("Could not find Rules map in Go file");
		}

		const rulesContent = rulesMatch[1];
		const rules = {};

		// Extract each rule line using regex
		const ruleLines = rulesContent.match(/"[^"]+"\s*:\s*"[^"]+"/g);

		if (!ruleLines) {
			throw new Error("Could not parse rules from Go file");
		}

		ruleLines.forEach((line) => {
			const match = line.match(/"([^"]+)"\s*:\s*"([^"]+)"/);
			if (match) {
				const [, ruleId, description] = match;
				rules[ruleId] = description;
			}
		});

		return rules;
	} catch (error) {
		console.error(`❌ Error reading Go file: ${error.message}`);
		process.exit(1);
	}
}

/**
 * Extract rules from TypeScript constants file
 * @param {string} tsFilePath - Path to the TypeScript constants file
 * @returns {Object} - Extracted rules object
 */
function extractRulesFromTSFile(tsFilePath) {
	try {
		const content = fs.readFileSync(tsFilePath, "utf8");

		// Find the violationRules object using regex
		const rulesMatch = content.match(/export const violationRules = \{([\s\S]*?)\};/);

		if (!rulesMatch) {
			throw new Error("Could not find violationRules in TypeScript file");
		}

		const rulesContent = rulesMatch[1];
		const rules = {};

		// Extract each rule line using regex
		const ruleLines = rulesContent.match(/[A-Z]\d+:\s*"[^"]+"/g);

		if (!ruleLines) {
			throw new Error("Could not parse rules from TypeScript file");
		}

		ruleLines.forEach((line) => {
			const match = line.match(/([A-Z]\d+):\s*"([^"]+)"/);
			if (match) {
				const [, ruleId, description] = match;
				rules[ruleId] = description;
			}
		});

		return rules;
	} catch (error) {
		console.error(`❌ Error reading TypeScript file: ${error.message}`);
		process.exit(1);
	}
}

/**
 * ANSI color codes for terminal output
 */
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
	bgRed: "\x1b[41m",
	bgGreen: "\x1b[42m",
	bgYellow: "\x1b[43m",
};

/**
 * Helper function to colorize text
 * @param {string} text - Text to colorize
 * @param {string} color - Color code
 * @returns {string} - Colorized text
 */
function colorize(text, color) {
	return `${color}${text}${colors.reset}`;
}

/**
 * Create a proper diff using dynamic programming to find the optimal alignment
 * @param {string} str1 - First string (backend)
 * @param {string} str2 - Second string (frontend)
 * @returns {Object} - Object with highlighted versions of both strings
 */
function createCharDiff(str1, str2) {
	// Use Myers' diff algorithm (simplified version)
	const diff = computeDiff(str1, str2);

	let highlighted1 = "";
	let highlighted2 = "";

	for (const operation of diff) {
		switch (operation.type) {
			case "equal":
				// Characters match - show normally
				if (operation.char === " ") {
					highlighted1 += "·"; // Show spaces as dots for clarity
					highlighted2 += "·";
				} else {
					highlighted1 += operation.char;
					highlighted2 += operation.char;
				}
				break;

			case "delete":
				// Character exists in backend but not frontend
				if (operation.char === " ") {
					highlighted1 += colorize("·", colors.green);
				} else {
					highlighted1 += colorize(operation.char, colors.green);
				}
				highlighted2 += colorize("∅", colors.yellow);
				break;

			case "insert":
				// Character exists in frontend but not backend
				highlighted1 += colorize("∅", colors.yellow);
				if (operation.char === " ") {
					highlighted2 += colorize("·", colors.red);
				} else {
					highlighted2 += colorize(operation.char, colors.red);
				}
				break;

			case "replace":
				// Characters are different
				if (operation.char1 === " ") {
					highlighted1 += colorize("·", colors.green);
				} else {
					highlighted1 += colorize(operation.char1, colors.green);
				}
				if (operation.char2 === " ") {
					highlighted2 += colorize("·", colors.red);
				} else {
					highlighted2 += colorize(operation.char2, colors.red);
				}
				break;
		}
	}

	return {
		backend: highlighted1,
		frontend: highlighted2,
	};
}

/**
 * Compute diff operations using a simplified Myers algorithm
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {Array} - Array of diff operations
 */
function computeDiff(str1, str2) {
	const len1 = str1.length;
	const len2 = str2.length;

	// Create a matrix for dynamic programming
	const matrix = Array(len1 + 1)
		.fill(null)
		.map(() => Array(len2 + 1).fill(0));

	// Fill the matrix
	for (let i = 0; i <= len1; i++) {
		for (let j = 0; j <= len2; j++) {
			if (i === 0) {
				matrix[i][j] = j;
			} else if (j === 0) {
				matrix[i][j] = i;
			} else if (str1[i - 1] === str2[j - 1]) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] =
					1 +
					Math.min(
						matrix[i - 1][j], // deletion
						matrix[i][j - 1], // insertion
						matrix[i - 1][j - 1] // substitution
					);
			}
		}
	}

	// Backtrack to find the operations
	const operations = [];
	let i = len1,
		j = len2;

	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && str1[i - 1] === str2[j - 1]) {
			// Characters match
			operations.unshift({ type: "equal", char: str1[i - 1] });
			i--;
			j--;
		} else if (i > 0 && j > 0 && matrix[i][j] === matrix[i - 1][j - 1] + 1) {
			// Substitution
			operations.unshift({ type: "replace", char1: str1[i - 1], char2: str2[j - 1] });
			i--;
			j--;
		} else if (i > 0 && matrix[i][j] === matrix[i - 1][j] + 1) {
			// Deletion
			operations.unshift({ type: "delete", char: str1[i - 1] });
			i--;
		} else if (j > 0 && matrix[i][j] === matrix[i][j - 1] + 1) {
			// Insertion
			operations.unshift({ type: "insert", char: str2[j - 1] });
			j--;
		}
	}

	return operations;
}

/**
 * Compare two rule objects and return differences
 * @param {Object} backendRules - Rules from Go backend
 * @param {Object} frontendRules - Rules from TypeScript frontend
 * @returns {Array} - Array of error messages
 */
function compareRules(backendRules, frontendRules) {
	const errors = [];

	// Check for missing rules in frontend
	for (const [ruleId, backendMessage] of Object.entries(backendRules)) {
		if (!(ruleId in frontendRules)) {
			errors.push(
				`${colorize("Missing rule in frontend:", colors.red)} ` +
					`${colorize(ruleId, colors.yellow)} - "${colorize(backendMessage, colors.cyan)}"`
			);
			continue;
		}

		const frontendMessage = frontendRules[ruleId];
		if (frontendMessage !== backendMessage) {
			const diff = createCharDiff(backendMessage, frontendMessage);
			errors.push(
				`${colorize("Rule message mismatch for", colors.red)} ${colorize(ruleId, colors.yellow)}:\n` +
					`  ${colorize("Backend: ", colors.blue)} "${diff.backend}"\n` +
					`  ${colorize("Frontend:", colors.magenta)} "${diff.frontend}"`
			);
		}
	}

	// Check for extra rules in frontend
	for (const [ruleId, frontendMessage] of Object.entries(frontendRules)) {
		if (!(ruleId in backendRules)) {
			errors.push(
				`${colorize("Extra rule in frontend:", colors.red)} ` +
					`${colorize(ruleId, colors.yellow)} - "${colorize(frontendMessage, colors.cyan)}"`
			);
		}
	}

	return errors;
}

/**
 * Main validation function
 */
function validateRuleConsistency() {
	console.log(colorize("🔍 Validating rule consistency between backend and frontend...", colors.cyan));

	// Define file paths
	const goFilePath = path.resolve(__dirname, "../src/autokitteh/internal/backend/projects/lint.go");
	const tsFilePath = path.resolve(__dirname, "../src/constants/project.constants.ts");

	// Check if files exist
	if (!fs.existsSync(goFilePath)) {
		console.error(colorize(`❌ Go lint file not found: ${goFilePath}`, colors.red));
		process.exit(1);
	}

	if (!fs.existsSync(tsFilePath)) {
		console.error(colorize(`❌ TypeScript constants file not found: ${tsFilePath}`, colors.red));
		process.exit(1);
	}

	// Extract rules from both files
	console.log(colorize("📖 Extracting rules from Go backend...", colors.blue));
	const backendRules = extractRulesFromGoFile(goFilePath);
	console.log(colorize(`   Found ${Object.keys(backendRules).length} backend rules`, colors.green));

	console.log(colorize("📖 Extracting rules from TypeScript frontend...", colors.magenta));
	const frontendRules = extractRulesFromTSFile(tsFilePath);
	console.log(colorize(`   Found ${Object.keys(frontendRules).length} frontend rules`, colors.green));

	// Compare rules
	const errors = compareRules(backendRules, frontendRules);

	if (errors.length > 0) {
		console.error("\n" + colorize("═".repeat(80), colors.red));
		console.error(
			colorize("❌ RULE VALIDATION FAILED", colors.red + colors.bright) +
				colorize(" - Frontend and Backend rule messages are out of sync!", colors.red)
		);
		console.error(colorize("═".repeat(80), colors.red));
		console.error(colorize("\nThe following inconsistencies were found:", colors.yellow + colors.bright));
		console.error("");
		errors.forEach((error, index) => {
			console.error(`${colorize(`${index + 1}.`, colors.red + colors.bright)} ${error}`);
			if (index < errors.length - 1) console.error(""); // Add spacing between errors
		});
		console.error("\n" + colorize("─".repeat(80), colors.yellow));
		console.error(
			colorize("Please update the rule messages in one of these files to match:", colors.yellow + colors.bright)
		);
		console.error(`${colorize("• Backend: ", colors.blue + colors.bright)} ${colorize(goFilePath, colors.cyan)}`);
		console.error(
			`${colorize("• Frontend:", colors.magenta + colors.bright)} ${colorize(tsFilePath, colors.cyan)}`
		);
		console.error(colorize("─".repeat(80), colors.yellow));
		console.error(
			colorize("\n🚫 Build has been stopped to prevent inconsistent behavior.\n", colors.red + colors.bright)
		);
		process.exit(1);
	}

	console.log("\n" + colorize("═".repeat(80), colors.green));
	console.log(
		colorize("✅ RULE VALIDATION PASSED", colors.green + colors.bright) +
			colorize(" - Frontend and Backend rules are synchronized", colors.green)
	);
	console.log(colorize("═".repeat(80), colors.green));
	console.log(
		colorize(`🎉 Successfully validated ${Object.keys(backendRules).length} rules`, colors.green + colors.bright)
	);
	console.log(colorize("   All rule messages match perfectly between backend and frontend\n", colors.green));
}

// Run validation
validateRuleConsistency();
