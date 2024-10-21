/* eslint-disable unicorn/filename-case */
/* eslint-disable no-undef */
/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs/promises");

const CONSTANTS_FILE = "src/constants/dashboard.constants.ts";

async function refineDashboardConstants() {
	console.log("Starting to refine dashboard.constants.ts...");

	let constantsContent = await fs.readFile(CONSTANTS_FILE, "utf-8");
	console.log("Successfully read the constants file.");

	// Replace all occurrences of '" with "
	constantsContent = constantsContent.replace(/'"/g, '"');
	constantsContent = constantsContent.replace(/""/g, '"');
	constantsContent = constantsContent.replace(/" "/g, '"');
	constantsContent = constantsContent.replace(/",",/g, '",');

	// Replace all occurrences of ",', with ",
	constantsContent = constantsContent.replace(/",',/g, '",');

	// Additional replacements to clean up description fields
	constantsContent = constantsContent.replace(/"description":\s*"\s*"(.*?)"",/g, '"description": "$1",');
	constantsContent = constantsContent.replace(/""(.*?)"",/g, '"$1",');

	await fs.writeFile(CONSTANTS_FILE, constantsContent, "utf-8");
	console.log("Refinement of dashboard.constants.ts completed successfully!");
}

refineDashboardConstants().catch(console.error);
