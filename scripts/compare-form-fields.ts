/* eslint-disable @typescript-eslint/naming-convention */
import * as fs from "fs";
import * as path from "path";

const BACKEND_PATH = "src/autokitteh/integrations";
const FRONTEND_PATH = "src/components/organisms/configuration/connections/integrations";
const VARIABLES_MAPPING_PATH = "src/constants/connections/integrationVariablesMapping.constants.ts";
const REPORT_OUTPUT_PATH = "scripts/reports/form-fields-comparison.json";

const COLORS = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	gray: "\x1b[90m",
};

const SKIP_BACKEND_DIRS = ["common", "internal", "oauth", "Makefile"];

const BACKEND_SAVE_HANDLER_FILES = ["auth.go", "save.go", "pat.go", "oauth.go"];

const EXCLUDED_FRONTEND_DISPLAY_FIELDS = new Set(["webhook"]);

const BACKEND_TO_FRONTEND_INTEGRATION: Record<string, string[]> = {
	google: ["google", "googlecalendar", "googleforms"],
	"google/gemini": ["gemini"],
	atlassian: ["jira", "confluence"],
	microsoft: ["microsoft"],
};

const FRONTEND_TO_BACKEND_INTEGRATION: Record<string, string> = {
	google: "google",
	googlecalendar: "google",
	googleforms: "google",
	gemini: "google/gemini",
	jira: "atlassian",
	confluence: "atlassian",
	microsoft: "microsoft",
};

const NESTED_BACKEND_INTEGRATIONS = ["google/gemini"];

const EXCLUDED_FRONTEND_FIELDS = new Set(["auth_type", "auth_scopes"]);

const EXCLUDED_BACKEND_FIELDS = new Set(["auth_type", "cid", "origin"]);

interface IntegrationFields {
	name: string;
	fields: string[];
	sources: { field: string; file: string; line?: number }[];
}

interface VariablesMapping {
	[integration: string]: {
		[formField: string]: string;
	};
}

interface IntegrationComparison {
	backendFields: string[];
	frontendFields: string[];
	mappedFields: { formField: string; storedVar: string }[];
	matchingFields: string[];
	missingInBackend: string[];
	missingInBackendAfterMapping: string[];
	missingInFrontend: string[];
	missingInFrontendAfterMapping: string[];
	name: string;
	status: "match" | "mismatch" | "backend_only" | "frontend_only";
	statusAfterMapping: "match" | "mismatch" | "backend_only" | "frontend_only";
	unmappedFrontendFields: string[];
}

interface FieldComparisonReport {
	timestamp: string;
	integrations: IntegrationComparison[];
	summary: {
		backendOnlyIntegrations: number;
		fieldsNotUsingMapping: number;
		fieldsUsingMapping: number;
		frontendOnlyIntegrations: number;
		matchingIntegrations: number;
		matchingIntegrationsAfterMapping: number;
		mismatchedIntegrations: number;
		mismatchedIntegrationsAfterMapping: number;
		totalIntegrations: number;
	};
}

function parseVariablesMapping(): VariablesMapping {
	const mappingFile = path.resolve(VARIABLES_MAPPING_PATH);
	const mapping: VariablesMapping = {};

	if (!fs.existsSync(mappingFile)) {
		console.warn(`${COLORS.yellow}Variables mapping file not found: ${mappingFile}${COLORS.reset}`);
		return mapping;
	}

	const content = fs.readFileSync(mappingFile, "utf-8");

	const integrationBlockRegex = /\[Integrations\.(\w+)\]:\s*\{([^}]+)\}/g;
	let match;

	while ((match = integrationBlockRegex.exec(content)) !== null) {
		const integrationName = match[1].toLowerCase();
		const fieldsBlock = match[2];

		const fieldMappings: { [key: string]: string } = {};
		const fieldRegex = /(\w+):\s*"([^"]+)"/g;
		let fieldMatch;

		while ((fieldMatch = fieldRegex.exec(fieldsBlock)) !== null) {
			const formField = fieldMatch[1];
			const storedVar = fieldMatch[2];
			fieldMappings[formField] = storedVar;
		}

		if (Object.keys(fieldMappings).length > 0) {
			mapping[integrationName] = fieldMappings;
		}
	}

	return mapping;
}

function parseBackendFields(): Map<string, IntegrationFields> {
	const integrations = new Map<string, IntegrationFields>();
	const integrationsDir = path.resolve(BACKEND_PATH);

	if (!fs.existsSync(integrationsDir)) {
		console.error(`${COLORS.red}Backend integrations directory not found: ${integrationsDir}${COLORS.reset}`);
		process.exit(1);
	}

	const entries = fs.readdirSync(integrationsDir, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isDirectory() || SKIP_BACKEND_DIRS.includes(entry.name)) {
			continue;
		}

		const integrationName = entry.name;
		const integrationPath = path.join(integrationsDir, integrationName);
		const fields = extractBackendFields(integrationPath);

		if (fields.fields.length > 0) {
			integrations.set(integrationName, {
				name: integrationName,
				...fields,
			});
		}
	}

	for (const nestedPath of NESTED_BACKEND_INTEGRATIONS) {
		const fullPath = path.join(integrationsDir, nestedPath);
		if (fs.existsSync(fullPath)) {
			const fields = extractBackendFields(fullPath);
			if (fields.fields.length > 0) {
				integrations.set(nestedPath, {
					name: nestedPath,
					...fields,
				});
			}
		}
	}

	return integrations;
}

function extractBackendFields(integrationPath: string): {
	fields: string[];
	sources: { field: string; file: string; line?: number }[];
} {
	const fields = new Set<string>();
	const sources: { field: string; file: string; line?: number }[] = [];

	const goFiles = findGoFiles(integrationPath);

	for (const goFile of goFiles) {
		const content = fs.readFileSync(goFile, "utf-8");
		const lines = content.split("\n");
		const relativePath = path.relative(process.cwd(), goFile);

		lines.forEach((line, index) => {
			const formValueMatches = line.matchAll(/r\.(?:FormValue|PostFormValue)\("([^"]+)"\)/g);
			for (const match of formValueMatches) {
				const fieldName = match[1];
				if (!EXCLUDED_BACKEND_FIELDS.has(fieldName) && !fields.has(fieldName)) {
					fields.add(fieldName);
					sources.push({ field: fieldName, file: relativePath, line: index + 1 });
				}
			}

			const formGetMatches = line.matchAll(/r\.Form\.Get\("([^"]+)"\)/g);
			for (const match of formGetMatches) {
				const fieldName = match[1];
				if (!EXCLUDED_BACKEND_FIELDS.has(fieldName) && !fields.has(fieldName)) {
					fields.add(fieldName);
					sources.push({ field: fieldName, file: relativePath, line: index + 1 });
				}
			}
		});
	}

	return {
		fields: Array.from(fields).sort(),
		sources,
	};
}

function findGoFiles(dir: string, onlySaveHandlers: boolean = true): string[] {
	const files: string[] = [];

	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...findGoFiles(fullPath, onlySaveHandlers));
		} else if (entry.name.endsWith(".go")) {
			if (onlySaveHandlers) {
				if (BACKEND_SAVE_HANDLER_FILES.includes(entry.name)) {
					files.push(fullPath);
				}
			} else {
				files.push(fullPath);
			}
		}
	}

	return files;
}

function parseFrontendFields(): Map<string, IntegrationFields> {
	const integrations = new Map<string, IntegrationFields>();
	const integrationsDir = path.resolve(FRONTEND_PATH);

	if (!fs.existsSync(integrationsDir)) {
		console.error(`${COLORS.red}Frontend integrations directory not found: ${integrationsDir}${COLORS.reset}`);
		process.exit(1);
	}

	const entries = fs.readdirSync(integrationsDir, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}

		const integrationName = entry.name;
		const integrationPath = path.join(integrationsDir, integrationName);
		const fields = extractFrontendFields(integrationPath);

		if (fields.fields.length > 0) {
			integrations.set(integrationName, {
				name: integrationName,
				...fields,
			});
		}
	}

	return integrations;
}

function extractFrontendFields(integrationPath: string): {
	fields: string[];
	sources: { field: string; file: string; line?: number }[];
} {
	const fields = new Set<string>();
	const sources: { field: string; file: string; line?: number }[] = [];

	const tsxFiles = findTsxFiles(integrationPath);

	for (const tsxFile of tsxFiles) {
		const content = fs.readFileSync(tsxFile, "utf-8");
		const lines = content.split("\n");
		const relativePath = path.relative(process.cwd(), tsxFile);

		lines.forEach((line, index) => {
			const registerMatches = line.matchAll(/register\("([^"]+)"\)/g);
			for (const match of registerMatches) {
				const fieldName = match[1];
				if (!EXCLUDED_FRONTEND_FIELDS.has(fieldName) && !fields.has(fieldName)) {
					fields.add(fieldName);
					sources.push({ field: fieldName, file: relativePath, line: index + 1 });
				}
			}

			const spreadRegisterMatches = line.matchAll(/\{\.\.\.register\("([^"]+)"(?:,\s*\{[^}]*\})?\)\}/g);
			for (const match of spreadRegisterMatches) {
				const fieldName = match[1];
				if (!EXCLUDED_FRONTEND_FIELDS.has(fieldName) && !fields.has(fieldName)) {
					fields.add(fieldName);
					sources.push({ field: fieldName, file: relativePath, line: index + 1 });
				}
			}

			const useWatchMatches = line.matchAll(/useWatch\(\{\s*control,\s*name:\s*"([^"]+)"\s*\}\)/g);
			for (const match of useWatchMatches) {
				const fieldName = match[1];
				if (!EXCLUDED_FRONTEND_FIELDS.has(fieldName) && !fields.has(fieldName)) {
					fields.add(fieldName);
					sources.push({ field: fieldName, file: relativePath, line: index + 1 });
				}
			}

			const setValueMatches = line.matchAll(/setValue\("([^"]+)"/g);
			for (const match of setValueMatches) {
				const fieldName = match[1];
				if (
					!EXCLUDED_FRONTEND_FIELDS.has(fieldName) &&
					!EXCLUDED_FRONTEND_DISPLAY_FIELDS.has(fieldName) &&
					!fields.has(fieldName)
				) {
					fields.add(fieldName);
					sources.push({ field: fieldName, file: relativePath, line: index + 1 });
				}
			}

			const controllerNameMatches = line.matchAll(/name="([^"]+)"/g);
			for (const match of controllerNameMatches) {
				const fieldName = match[1];
				if (!EXCLUDED_FRONTEND_FIELDS.has(fieldName) && !fields.has(fieldName)) {
					fields.add(fieldName);
					sources.push({ field: fieldName, file: relativePath, line: index + 1 });
				}
			}

			const formFieldsArrayMatches = line.matchAll(/\{\s*name:\s*"([^"]+)"/g);
			for (const match of formFieldsArrayMatches) {
				const fieldName = match[1];
				if (!EXCLUDED_FRONTEND_FIELDS.has(fieldName) && !fields.has(fieldName)) {
					fields.add(fieldName);
					sources.push({ field: fieldName, file: relativePath, line: index + 1 });
				}
			}
		});
	}

	return {
		fields: Array.from(fields).sort(),
		sources,
	};
}

function findTsxFiles(dir: string): string[] {
	const files: string[] = [];

	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...findTsxFiles(fullPath));
		} else if (entry.name.endsWith(".tsx")) {
			files.push(fullPath);
		}
	}

	return files;
}

function compareFields(
	backend: Map<string, IntegrationFields>,
	frontend: Map<string, IntegrationFields>,
	variablesMapping: VariablesMapping
): FieldComparisonReport {
	const report: FieldComparisonReport = {
		timestamp: new Date().toISOString(),
		integrations: [],
		summary: {
			backendOnlyIntegrations: 0,
			fieldsNotUsingMapping: 0,
			fieldsUsingMapping: 0,
			frontendOnlyIntegrations: 0,
			matchingIntegrations: 0,
			matchingIntegrationsAfterMapping: 0,
			mismatchedIntegrations: 0,
			mismatchedIntegrationsAfterMapping: 0,
			totalIntegrations: 0,
		},
	};

	const processedFrontend = new Set<string>();
	const allIntegrations = new Set<string>();

	let totalMappedFields = 0;
	let totalUnmappedFields = 0;

	for (const [backendName, backendData] of backend) {
		allIntegrations.add(backendName);
		const frontendNames = BACKEND_TO_FRONTEND_INTEGRATION[backendName] || [backendName];

		let foundInFrontend = false;

		for (const frontendName of frontendNames) {
			if (frontend.has(frontendName)) {
				foundInFrontend = true;
				processedFrontend.add(frontendName);

				const frontendData = frontend.get(frontendName)!;
				const backendFields = new Set(backendData.fields);
				const frontendFields = new Set(frontendData.fields);

				const matchingFields = backendData.fields.filter((f) => frontendFields.has(f));
				const missingInFrontend = backendData.fields.filter((f) => !frontendFields.has(f));
				const missingInBackend = frontendData.fields.filter((f) => !backendFields.has(f));

				const integrationMapping = variablesMapping[frontendName] || {};
				const mappedFields: { formField: string; storedVar: string }[] = [];
				const unmappedFrontendFields: string[] = [];

				for (const field of frontendData.fields) {
					if (integrationMapping[field]) {
						mappedFields.push({ formField: field, storedVar: integrationMapping[field] });
						totalMappedFields++;
					} else {
						unmappedFrontendFields.push(field);
						totalUnmappedFields++;
					}
				}

				const mappedFormFields = new Set(Object.keys(integrationMapping));
				const missingInFrontendAfterMapping = missingInFrontend.filter((f) => !["error", "oauth"].includes(f));
				const missingInBackendAfterMapping = missingInBackend.filter((f) => !mappedFormFields.has(f));

				const status = missingInFrontend.length === 0 && missingInBackend.length === 0 ? "match" : "mismatch";
				const statusAfterMapping =
					missingInFrontendAfterMapping.length === 0 && missingInBackendAfterMapping.length === 0
						? "match"
						: "mismatch";

				report.integrations.push({
					backendFields: backendData.fields,
					frontendFields: frontendData.fields,
					mappedFields,
					matchingFields,
					missingInBackend,
					missingInBackendAfterMapping,
					missingInFrontend,
					missingInFrontendAfterMapping,
					name: backendName === frontendName ? backendName : `${backendName} → ${frontendName}`,
					status,
					statusAfterMapping,
					unmappedFrontendFields,
				});
			}
		}

		if (!foundInFrontend) {
			report.integrations.push({
				backendFields: backendData.fields,
				frontendFields: [],
				mappedFields: [],
				matchingFields: [],
				missingInBackend: [],
				missingInBackendAfterMapping: [],
				missingInFrontend: backendData.fields,
				missingInFrontendAfterMapping: backendData.fields.filter((f) => !["error", "oauth"].includes(f)),
				name: backendName,
				status: "backend_only",
				statusAfterMapping: "backend_only",
				unmappedFrontendFields: [],
			});
		}
	}

	for (const [frontendName, frontendData] of frontend) {
		if (processedFrontend.has(frontendName)) {
			continue;
		}

		const backendName = FRONTEND_TO_BACKEND_INTEGRATION[frontendName];
		if (backendName && backend.has(backendName)) {
			continue;
		}

		const integrationMapping = variablesMapping[frontendName] || {};
		const mappedFields: { formField: string; storedVar: string }[] = [];
		const unmappedFrontendFields: string[] = [];

		for (const field of frontendData.fields) {
			if (integrationMapping[field]) {
				mappedFields.push({ formField: field, storedVar: integrationMapping[field] });
				totalMappedFields++;
			} else {
				unmappedFrontendFields.push(field);
				totalUnmappedFields++;
			}
		}

		allIntegrations.add(frontendName);
		report.integrations.push({
			backendFields: [],
			frontendFields: frontendData.fields,
			mappedFields,
			matchingFields: [],
			missingInBackend: frontendData.fields,
			missingInBackendAfterMapping: frontendData.fields,
			missingInFrontend: [],
			missingInFrontendAfterMapping: [],
			name: frontendName,
			status: "frontend_only",
			statusAfterMapping: "frontend_only",
			unmappedFrontendFields,
		});
	}

	report.integrations.sort((a, b) => a.name.localeCompare(b.name));

	report.summary.totalIntegrations = report.integrations.length;
	report.summary.matchingIntegrations = report.integrations.filter((i) => i.status === "match").length;
	report.summary.matchingIntegrationsAfterMapping = report.integrations.filter(
		(i) => i.statusAfterMapping === "match"
	).length;
	report.summary.mismatchedIntegrations = report.integrations.filter((i) => i.status === "mismatch").length;
	report.summary.mismatchedIntegrationsAfterMapping = report.integrations.filter(
		(i) => i.statusAfterMapping === "mismatch"
	).length;
	report.summary.backendOnlyIntegrations = report.integrations.filter((i) => i.status === "backend_only").length;
	report.summary.frontendOnlyIntegrations = report.integrations.filter((i) => i.status === "frontend_only").length;
	report.summary.fieldsUsingMapping = totalMappedFields;
	report.summary.fieldsNotUsingMapping = totalUnmappedFields;

	return report;
}

function printReport(report: FieldComparisonReport): void {
	console.log(`\n${COLORS.bright}${COLORS.cyan}=== Form Fields Comparison ===${COLORS.reset}\n`);
	console.log(`${COLORS.gray}Timestamp: ${report.timestamp}${COLORS.reset}`);
	console.log(`Total integrations analyzed: ${COLORS.blue}${report.summary.totalIntegrations}${COLORS.reset}\n`);

	const mismatches = report.integrations.filter((i) => i.status === "mismatch");
	if (mismatches.length > 0) {
		console.log(`${COLORS.bright}${COLORS.red}--- Field Mismatches ---${COLORS.reset}`);
		for (const integration of mismatches) {
			console.log(`\n${COLORS.red}[${integration.name}]${COLORS.reset}`);
			console.log(`  Backend fields:  ${COLORS.gray}[${integration.backendFields.join(", ")}]${COLORS.reset}`);
			console.log(`  Frontend fields: ${COLORS.gray}[${integration.frontendFields.join(", ")}]${COLORS.reset}`);
			if (integration.missingInFrontend.length > 0) {
				console.log(
					`  ${COLORS.red}Missing in frontend: [${integration.missingInFrontend.join(", ")}]${COLORS.reset}`
				);
			}
			if (integration.missingInBackend.length > 0) {
				console.log(
					`  ${COLORS.yellow}Missing in backend: [${integration.missingInBackend.join(", ")}]${COLORS.reset}`
				);
			}
			if (integration.mappedFields.length > 0) {
				console.log(`  ${COLORS.cyan}Mapped fields (form → stored):${COLORS.reset}`);
				for (const m of integration.mappedFields) {
					console.log(`    ${COLORS.gray}${m.formField} → ${m.storedVar}${COLORS.reset}`);
				}
			}
			if (integration.unmappedFrontendFields.length > 0) {
				console.log(
					`  ${COLORS.yellow}Unmapped frontend fields: [${integration.unmappedFrontendFields.join(", ")}]${COLORS.reset}`
				);
			}
		}
	}

	const backendOnly = report.integrations.filter((i) => i.status === "backend_only");
	if (backendOnly.length > 0) {
		console.log(`\n${COLORS.bright}${COLORS.yellow}--- Backend Only (no frontend forms) ---${COLORS.reset}`);
		for (const integration of backendOnly) {
			console.log(`\n${COLORS.yellow}[${integration.name}]${COLORS.reset}`);
			console.log(`  Backend fields: ${COLORS.gray}[${integration.backendFields.join(", ")}]${COLORS.reset}`);
		}
	}

	const frontendOnly = report.integrations.filter((i) => i.status === "frontend_only");
	if (frontendOnly.length > 0) {
		console.log(`\n${COLORS.bright}${COLORS.yellow}--- Frontend Only (no backend handler) ---${COLORS.reset}`);
		for (const integration of frontendOnly) {
			console.log(`\n${COLORS.yellow}[${integration.name}]${COLORS.reset}`);
			console.log(`  Frontend fields: ${COLORS.gray}[${integration.frontendFields.join(", ")}]${COLORS.reset}`);
		}
	}

	const matches = report.integrations.filter((i) => i.status === "match");
	if (matches.length > 0) {
		console.log(`\n${COLORS.bright}${COLORS.green}--- Matching Integrations ---${COLORS.reset}`);
		const matchNames = matches.map((m) => m.name).join(", ");
		console.log(`${COLORS.green}${matchNames}${COLORS.reset}`);
	}

	console.log(`\n${COLORS.bright}${COLORS.cyan}` + "=".repeat(60) + `${COLORS.reset}`);
	console.log(`${COLORS.bright}${COLORS.cyan}=== AFTER APPLYING integrationVariablesMapping ===${COLORS.reset}`);
	console.log(`${COLORS.bright}${COLORS.cyan}` + "=".repeat(60) + `${COLORS.reset}`);
	console.log(`${COLORS.gray}(Excludes expected backend-only fields: error, oauth)${COLORS.reset}\n`);

	const mismatchesAfterMapping = report.integrations.filter(
		(i) => i.statusAfterMapping === "mismatch" && i.status !== "backend_only" && i.status !== "frontend_only"
	);
	if (mismatchesAfterMapping.length > 0) {
		console.log(`${COLORS.bright}${COLORS.red}--- REAL Mismatches (after mapping) ---${COLORS.reset}`);
		for (const integration of mismatchesAfterMapping) {
			console.log(`\n${COLORS.red}[${integration.name}]${COLORS.reset}`);
			if (integration.missingInFrontendAfterMapping.length > 0) {
				console.log(
					`  ${COLORS.red}Missing in frontend: [${integration.missingInFrontendAfterMapping.join(", ")}]${COLORS.reset}`
				);
			}
			if (integration.missingInBackendAfterMapping.length > 0) {
				console.log(
					`  ${COLORS.yellow}Missing in backend: [${integration.missingInBackendAfterMapping.join(", ")}]${COLORS.reset}`
				);
			}
		}
	}

	const matchesAfterMapping = report.integrations.filter(
		(i) => i.statusAfterMapping === "match" && i.status !== "backend_only" && i.status !== "frontend_only"
	);
	if (matchesAfterMapping.length > 0) {
		console.log(`\n${COLORS.bright}${COLORS.green}--- Matching After Mapping ---${COLORS.reset}`);
		const matchNamesAfter = matchesAfterMapping.map((m) => m.name).join(", ");
		console.log(`${COLORS.green}${matchNamesAfter}${COLORS.reset}`);
	}

	console.log(`\n${COLORS.bright}--- Summary ---${COLORS.reset}`);
	console.log(`${COLORS.green}Matching (raw): ${report.summary.matchingIntegrations}${COLORS.reset}`);
	console.log(
		`${COLORS.green}Matching (after mapping): ${report.summary.matchingIntegrationsAfterMapping}${COLORS.reset}`
	);
	console.log(`${COLORS.red}Mismatched (raw): ${report.summary.mismatchedIntegrations}${COLORS.reset}`);
	console.log(
		`${COLORS.red}Mismatched (after mapping): ${report.summary.mismatchedIntegrationsAfterMapping}${COLORS.reset}`
	);
	console.log(`${COLORS.yellow}Backend only: ${report.summary.backendOnlyIntegrations}${COLORS.reset}`);
	console.log(`${COLORS.yellow}Frontend only: ${report.summary.frontendOnlyIntegrations}${COLORS.reset}`);

	console.log(`\n${COLORS.bright}--- Mapping Analysis ---${COLORS.reset}`);
	console.log(
		`${COLORS.cyan}Fields using integrationVariablesMapping: ${report.summary.fieldsUsingMapping}${COLORS.reset}`
	);
	console.log(
		`${COLORS.gray}Fields NOT using mapping (form=stored): ${report.summary.fieldsNotUsingMapping}${COLORS.reset}`
	);

	const totalIssuesAfterMapping =
		report.summary.mismatchedIntegrationsAfterMapping +
		report.summary.backendOnlyIntegrations +
		report.summary.frontendOnlyIntegrations;
	if (totalIssuesAfterMapping === 0) {
		console.log(`\n${COLORS.green}${COLORS.bright}All form fields match after applying mapping!${COLORS.reset}\n`);
	} else {
		console.log(
			`\n${COLORS.red}${COLORS.bright}Total issues after mapping: ${totalIssuesAfterMapping}${COLORS.reset}\n`
		);
	}
}

function saveJsonReport(report: FieldComparisonReport): void {
	const reportDir = path.dirname(path.resolve(REPORT_OUTPUT_PATH));
	if (!fs.existsSync(reportDir)) {
		fs.mkdirSync(reportDir, { recursive: true });
	}

	fs.writeFileSync(path.resolve(REPORT_OUTPUT_PATH), JSON.stringify(report, null, 2));
	console.log(`${COLORS.gray}JSON report saved to: ${REPORT_OUTPUT_PATH}${COLORS.reset}\n`);
}

function main(): void {
	console.log(`${COLORS.cyan}Parsing backend form fields...${COLORS.reset}`);
	const backendFields = parseBackendFields();

	console.log(`${COLORS.cyan}Parsing frontend form fields...${COLORS.reset}`);
	const frontendFields = parseFrontendFields();

	console.log(`${COLORS.cyan}Parsing integrationVariablesMapping...${COLORS.reset}`);
	const variablesMapping = parseVariablesMapping();

	const report = compareFields(backendFields, frontendFields, variablesMapping);

	printReport(report);
	saveJsonReport(report);
}

main();
