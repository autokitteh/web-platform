/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
/* eslint-disable no-console */
const fs = require("fs/promises");
const prettier = require("prettier");

const CONSTANTS_FILE = "src/constants/dashboard.constants.ts";
const PRETTIER_CONFIG_FILE = ".prettierrc";

async function refineDashboardConstants() {
    console.log("Starting to refine dashboard.constants.ts...");

    let constantsContent = await fs.readFile(CONSTANTS_FILE, "utf-8");
    console.log("Successfully read the constants file.");

    constantsContent = constantsContent.replace(/'"/g, '"');
    constantsContent = constantsContent.replace(/""/g, '"');
    constantsContent = constantsContent.replace(/" "/g, '"');
    constantsContent = constantsContent.replace(/",",/g, '",');
    constantsContent = constantsContent.replace(/",',/g, '",');

    // Additional replacements to clean up description fields
    constantsContent = constantsContent.replace(/"description":\s*"\s*"(.*?)"",/g, '"description": "$1",');
    constantsContent = constantsContent.replace(/""(.*?)"",/g, '"$1",');

    await fs.writeFile(CONSTANTS_FILE, constantsContent, "utf-8");
    console.log("Refinement of dashboard.constants.ts completed successfully!");

    // Run Prettier to format the file
    await runPrettier();
}

async function runPrettier() {
    console.log("Starting Prettier...");

    const constantsContent = await fs.readFile(CONSTANTS_FILE, "utf-8");
    const prettierConfig = await prettier.resolveConfig(PRETTIER_CONFIG_FILE);
    const formatted = await prettier.format(constantsContent, {
        ...prettierConfig,
        filepath: CONSTANTS_FILE,
    });

    await fs.writeFile(CONSTANTS_FILE, formatted, "utf-8");
    console.log("Prettier completed successfully!");
}

refineDashboardConstants().catch(console.error);