/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, "../e2e/fixtures/connection-test-cases.json");

async function main() {
	try {
		console.log("🔄 Generating connection test data from source constants...\n");

		const { IntegrationsMap, shouldHideIntegration } = await import("../src/enums/components/integrations.enum");
		const { getIntegrationAuthMethods, authMethodLabels } = await import(
			"../src/constants/connections/integrationConfigHelpers"
		);

		const testCases: Array<{
			authLabel?: string | null;
			authType?: string | null;
			category: "single-type" | "multi-type";
			integration: string;
			label: string;
			testName: string;
		}> = [];

		for (const [integration, config] of Object.entries(IntegrationsMap)) {
			if (shouldHideIntegration[integration as keyof typeof shouldHideIntegration]) {
				continue;
			}

			const authMethods = getIntegrationAuthMethods(integration as Integrations);

			const filteredAuthMethods = authMethods?.filter((authMethod) => !authMethod.skipTest) || [];

			if (filteredAuthMethods.length === 0) {
				testCases.push({
					testName: `${config.label} (no auth types)`,
					integration: config.value,
					label: config.label,
					authType: null,
					authLabel: null,
					category: "single-type",
				});
			} else if (filteredAuthMethods.length === 1) {
				const authConfig = filteredAuthMethods[0];
				const authLabel = authMethodLabels[authConfig.authType];
				testCases.push({
					testName: `${config.label} - ${authLabel}`,
					integration: config.value,
					label: config.label,
					authType: authConfig.authType,
					authLabel: authLabel,
					category: "single-type",
				});
			} else {
				for (const authConfig of filteredAuthMethods) {
					const authLabel = authMethodLabels[authConfig.authType];
					testCases.push({
						testName: `${config.label} - ${authLabel}`,
						integration: config.value,
						label: config.label,
						authType: authConfig.authType,
						authLabel: authLabel,
						category: "multi-type",
					});
				}
			}
		}

		const fixturesDir = path.dirname(OUTPUT_PATH);
		if (!fs.existsSync(fixturesDir)) {
			fs.mkdirSync(fixturesDir, { recursive: true });
		}

		fs.writeFileSync(OUTPUT_PATH, JSON.stringify(testCases, null, 2));

		const singleType = testCases.filter((tc) => tc.category === "single-type");
		const multiType = testCases.filter((tc) => tc.category === "multi-type");

		console.log("✅ Successfully generated connection test data!\n");
		console.log("📊 Statistics:");
		console.log(`   Total test cases: ${testCases.length}`);
		console.log(`   Single-type: ${singleType.length}`);
		console.log(`   Multi-type: ${multiType.length}`);
		console.log(`   Source: Direct from src/ constants (single source of truth!)`);
		console.log(`   Output: ${OUTPUT_PATH}\n`);
	} catch (error) {
		console.error("❌ Error generating test data:", error);
		process.exit(1);
	}
}

main();
