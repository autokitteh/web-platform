/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs/promises");
const prettier = require("prettier");

const CONSTANTS_FILE = "src/constants/dashboard.constants.ts";

async function refineDashboardConstants() {
    console.log("Starting to refine dashboard.constants.ts...");

    const constantsContent = await fs.readFile(CONSTANTS_FILE, "utf-8");
    console.log("Successfully read the constants file.");

    try {
        // Run Prettier
        const formatted = await prettier.format(constantsContent, {
            parser: "typescript",
            filepath: CONSTANTS_FILE,
            printWidth: 120,
            useTabs: true,
            tabWidth: 4,
            singleQuote: false,
            arrowParens: "always",
            bracketSpacing: true,
            jsxSingleQuote: false,
            quoteProps: "consistent",
            semi: true,
            trailingComma: "es5",
        });

        await fs.writeFile(CONSTANTS_FILE, formatted, "utf-8");
        console.log("Refinement and formatting completed successfully!");
    } catch (error) {
        console.error("Error during formatting:", error);
        // If Prettier fails, keep the unformatted but valid content
        await fs.writeFile(CONSTANTS_FILE, constantsContent, "utf-8");
        console.log("Saved with basic fixes only due to formatting error.");
    }
}

refineDashboardConstants().catch(console.error);