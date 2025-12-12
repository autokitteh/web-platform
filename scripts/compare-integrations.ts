/* eslint-disable no-console */
import * as fs from "fs";
import * as path from "path";

const BACKEND_PATH = "src/autokitteh/integrations";
const FRONTEND_MAPPING_PATH = "src/constants/connections/formsPerIntegrationsMapping.constants.ts";
const FRONTEND_ENUM_PATH = "src/enums/components/connection.enum.ts";
const FRONTEND_AUTH_ENUM_PATH = "src/enums/connections/connectionTypes.enum.ts";
const REPORT_OUTPUT_PATH = "scripts/reports/integration-comparison.json";

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

const BACKEND_AUTH_TYPES: Record<string, string> = {
	APIKey: "apiKey",
	APIToken: "apiToken",
	DaemonApp: "daemonApp",
	Init: "initialized",
	JSONKey: "jsonKey",
	OAuth: "oauth",
	OAuthDefault: "oauthDefault",
	OAuthPrivate: "oauthPrivate",
	PAT: "pat",
	ServerToServer: "serverToServer",
	SocketMode: "socketMode",
	BotToken: "botToken",
};

const FRONTEND_AUTH_TYPE_MAP: Record<string, string> = {
	apiKey: "ApiKey",
	apiToken: "ApiToken",
	daemonApp: "DaemonApp",
	initialized: "Initialized",
	jsonKey: "JsonKey",
	oauth: "Oauth",
	oauthDefault: "OauthDefault",
	oauthPrivate: "OauthPrivate",
	pat: "Pat",
	serverToServer: "serverToServer",
	socketMode: "Socket",
	botToken: "BotToken",
	json: "Json",
	authToken: "AuthToken",
};

const BACKEND_TO_FRONTEND_INTEGRATION: Record<string, string[]> = {
	google: ["gmail", "sheets", "calendar", "drive", "forms", "youtube", "googlegemini"],
	atlassian: ["jira", "confluence"],
	microsoft: ["microsoft_teams"],
};

const FRONTEND_TO_BACKEND_INTEGRATION: Record<string, string> = {
	gmail: "google",
	sheets: "google",
	calendar: "google",
	drive: "google",
	forms: "google",
	youtube: "google",
	googlegemini: "google",
	jira: "atlassian",
	confluence: "atlassian",
	microsoft_teams: "microsoft",
};

const SKIP_BACKEND_DIRS = ["common", "internal", "oauth", "Makefile"];

interface IntegrationAuthTypes {
	name: string;
	authTypes: string[];
}

interface ComparisonReport {
	timestamp: string;
	backendCount: number;
	frontendCount: number;
	backendOnly: IntegrationAuthTypes[];
	frontendOnly: IntegrationAuthTypes[];
	authTypeMismatches: {
		backendAuthTypes: string[];
		extraInFrontend: string[];
		frontendAuthTypes: string[];
		integration: string;
		missingInFrontend: string[];
	}[];
	matches: string[];
}

function parseBackendIntegrations(): Map<string, string[]> {
	const integrations = new Map<string, string[]>();
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
		const authTypes = extractAuthTypesFromIntegration(path.join(integrationsDir, integrationName));

		if (authTypes.length > 0) {
			integrations.set(integrationName, authTypes);
		}
	}

	return integrations;
}

function extractAuthTypesFromIntegration(integrationPath: string): string[] {
	const authTypes = new Set<string>();

	const goFiles = fs.readdirSync(integrationPath).filter((f) => f.endsWith(".go"));

	for (const goFile of goFiles) {
		const filePath = path.join(integrationPath, goFile);
		const content = fs.readFileSync(filePath, "utf-8");

		for (const [constant, value] of Object.entries(BACKEND_AUTH_TYPES)) {
			const casePattern = new RegExp(`case\\s+integrations\\.${constant}\\b`, "g");
			if (casePattern.test(content)) {
				authTypes.add(value);
			}
		}

		const authTypePatterns = [
			/switch\s+(?:authType|r\.FormValue\("auth_type"\)|r\.Form(?:Value)?\("auth_type"\)|r\.Form\.Get\("auth_type"\))/g,
			/r\.FormValue\("auth_type"\)/g,
		];

		let hasAuthTypeSwitch = false;
		for (const pattern of authTypePatterns) {
			if (pattern.test(content)) {
				hasAuthTypeSwitch = true;
				break;
			}
		}

		if (hasAuthTypeSwitch) {
			const caseStatements = content.match(/case\s+"[^"]*"(?:\s*,\s*"[^"]*")*:/g) || [];
			for (const caseStmt of caseStatements) {
				const values = caseStmt.match(/"([^"]*)"/g) || [];
				for (const quotedValue of values) {
					const caseValue = quotedValue.replace(/"/g, "");
					if (caseValue === "" || caseValue === "json" || caseValue === "jsonKey") {
						authTypes.add("jsonKey");
					} else if (caseValue === "oauth") {
						authTypes.add("oauth");
					} else if (Object.values(BACKEND_AUTH_TYPES).includes(caseValue)) {
						authTypes.add(caseValue);
					}
				}
			}
		}
	}

	if (authTypes.size === 0) {
		for (const goFile of goFiles) {
			const content = fs.readFileSync(path.join(integrationPath, goFile), "utf-8");
			if (/common\.SaveAuthType\(/.test(content) || /sdkintegrations\.NewConnectionInit/.test(content)) {
				authTypes.add("initialized");
				break;
			}
		}
	}

	return Array.from(authTypes).sort();
}

function parseFrontendIntegrations(): Map<string, string[]> {
	const integrations = new Map<string, string[]>();

	const enumContent = fs.readFileSync(path.resolve(FRONTEND_ENUM_PATH), "utf-8");
	const enumMatch = enumContent.match(/export enum Integrations\s*\{([^}]+)\}/);

	if (!enumMatch) {
		console.error(`${COLORS.red}Could not parse Integrations enum${COLORS.reset}`);
		process.exit(1);
	}

	const integrationNames: string[] = [];
	const enumBody = enumMatch[1];
	const enumEntryRegex = /(\w+)\s*=\s*["'](\w+)["']/g;
	let match;
	while ((match = enumEntryRegex.exec(enumBody)) !== null) {
		integrationNames.push(match[2]);
	}

	const mappingContent = fs.readFileSync(path.resolve(FRONTEND_MAPPING_PATH), "utf-8");

	for (const integrationName of integrationNames) {
		const authTypes = extractFrontendAuthTypes(mappingContent, integrationName);
		integrations.set(integrationName, authTypes);
	}

	return integrations;
}

function extractFrontendAuthTypes(mappingContent: string, integrationName: string): string[] {
	const authTypes: string[] = [];

	const patterns = [
		new RegExp(`\\[Integrations\\.${integrationName}\\]:\\s*\\{([^}]+)\\}`, "s"),
		new RegExp(`${integrationName}:\\s*\\{([^}]+)\\}`, "s"),
	];

	for (const pattern of patterns) {
		const match = mappingContent.match(pattern);
		if (match) {
			const blockContent = match[1];
			const authTypeRegex = /\[ConnectionAuthType\.(\w+)\]/g;
			let authMatch;
			while ((authMatch = authTypeRegex.exec(blockContent)) !== null) {
				const frontendAuthType = authMatch[1];
				const normalizedType = normalizeAuthType(frontendAuthType);
				if (normalizedType && !authTypes.includes(normalizedType)) {
					authTypes.push(normalizedType);
				}
			}
			break;
		}
	}

	return authTypes.sort();
}

function normalizeAuthType(frontendType: string): string {
	const mapping: Record<string, string> = {
		ApiKey: "apiKey",
		ApiToken: "apiToken",
		AuthToken: "authToken",
		BotToken: "botToken",
		DaemonApp: "daemonApp",
		Initialized: "initialized",
		Json: "json",
		JsonKey: "jsonKey",
		Oauth: "oauth",
		OauthDefault: "oauthDefault",
		OauthPrivate: "oauthPrivate",
		Pat: "pat",
		serverToServer: "serverToServer",
		Socket: "socketMode",
	};

	return mapping[frontendType] || frontendType.toLowerCase();
}

function compareIntegrations(backend: Map<string, string[]>, frontend: Map<string, string[]>): ComparisonReport {
	const report: ComparisonReport = {
		timestamp: new Date().toISOString(),
		backendCount: backend.size,
		frontendCount: frontend.size,
		backendOnly: [],
		frontendOnly: [],
		authTypeMismatches: [],
		matches: [],
	};

	const processedFrontend = new Set<string>();
	const processedBackend = new Set<string>();

	for (const [backendName, backendAuthTypes] of backend) {
		const frontendNames = BACKEND_TO_FRONTEND_INTEGRATION[backendName] || [backendName];

		let foundInFrontend = false;

		for (const frontendName of frontendNames) {
			if (frontend.has(frontendName)) {
				foundInFrontend = true;
				processedFrontend.add(frontendName);
				processedBackend.add(backendName);

				const frontendAuthTypes = frontend.get(frontendName) || [];
				const normalizedBackend = normalizeBackendAuthTypes(backendAuthTypes);
				const normalizedFrontend = frontendAuthTypes;

				const missingInFrontend = normalizedBackend.filter(
					(t) => !normalizedFrontend.includes(t) && !isEquivalentAuthType(t, normalizedFrontend)
				);
				const extraInFrontend = normalizedFrontend.filter(
					(t) => !normalizedBackend.includes(t) && !isEquivalentAuthType(t, normalizedBackend)
				);

				if (missingInFrontend.length > 0 || extraInFrontend.length > 0) {
					report.authTypeMismatches.push({
						integration: `${backendName} → ${frontendName}`,
						backendAuthTypes: normalizedBackend,
						frontendAuthTypes: normalizedFrontend,
						missingInFrontend,
						extraInFrontend,
					});
				} else {
					report.matches.push(`${backendName} → ${frontendName}`);
				}
			}
		}

		if (!foundInFrontend) {
			report.backendOnly.push({
				name: backendName,
				authTypes: backendAuthTypes,
			});
		}
	}

	for (const [frontendName, frontendAuthTypes] of frontend) {
		if (processedFrontend.has(frontendName)) {
			continue;
		}

		const backendName = FRONTEND_TO_BACKEND_INTEGRATION[frontendName];

		if (backendName && backend.has(backendName)) {
			processedFrontend.add(frontendName);
			continue;
		}

		if (frontendAuthTypes.length > 0) {
			report.frontendOnly.push({
				name: frontendName,
				authTypes: frontendAuthTypes,
			});
		}
	}

	return report;
}

function normalizeBackendAuthTypes(types: string[]): string[] {
	return types.map((t) => {
		if (t === "socketMode") return "socketMode";
		return t;
	});
}

function isEquivalentAuthType(type: string, types: string[]): boolean {
	const equivalents: Record<string, string[]> = {
		oauth: ["oauthDefault"],
		oauthDefault: ["oauth"],
		json: ["jsonKey"],
		jsonKey: ["json"],
	};

	const equivTypes = equivalents[type] || [];
	return equivTypes.some((eq) => types.includes(eq));
}

function printReport(report: ComparisonReport): void {
	console.log(`\n${COLORS.bright}${COLORS.cyan}=== Integration Auth Types Comparison ===${COLORS.reset}\n`);
	console.log(`${COLORS.gray}Timestamp: ${report.timestamp}${COLORS.reset}`);
	console.log(`Backend integrations found: ${COLORS.blue}${report.backendCount}${COLORS.reset}`);
	console.log(`Frontend integrations found: ${COLORS.blue}${report.frontendCount}${COLORS.reset}`);

	if (report.backendOnly.length > 0) {
		console.log(`\n${COLORS.bright}${COLORS.yellow}--- Backend Only (missing in frontend) ---${COLORS.reset}`);
		for (const integration of report.backendOnly) {
			console.log(`\n${COLORS.yellow}[${integration.name}]${COLORS.reset}`);
			console.log(`  Auth types: ${COLORS.gray}[${integration.authTypes.join(", ")}]${COLORS.reset}`);
		}
	}

	if (report.frontendOnly.length > 0) {
		console.log(`\n${COLORS.bright}${COLORS.yellow}--- Frontend Only (missing in backend) ---${COLORS.reset}`);
		for (const integration of report.frontendOnly) {
			console.log(`\n${COLORS.yellow}[${integration.name}]${COLORS.reset}`);
			console.log(`  Auth types: ${COLORS.gray}[${integration.authTypes.join(", ")}]${COLORS.reset}`);
		}
	}

	if (report.authTypeMismatches.length > 0) {
		console.log(`\n${COLORS.bright}${COLORS.red}--- Auth Type Mismatches ---${COLORS.reset}`);
		for (const mismatch of report.authTypeMismatches) {
			console.log(`\n${COLORS.red}[${mismatch.integration}]${COLORS.reset}`);
			console.log(
				`  Backend auth types:  ${COLORS.gray}[${mismatch.backendAuthTypes.join(", ")}]${COLORS.reset}`
			);
			console.log(
				`  Frontend auth types: ${COLORS.gray}[${mismatch.frontendAuthTypes.join(", ")}]${COLORS.reset}`
			);
			if (mismatch.missingInFrontend.length > 0) {
				console.log(
					`  ${COLORS.red}Missing in frontend: [${mismatch.missingInFrontend.join(", ")}]${COLORS.reset}`
				);
			}
			if (mismatch.extraInFrontend.length > 0) {
				console.log(
					`  ${COLORS.yellow}Extra in frontend: [${mismatch.extraInFrontend.join(", ")}]${COLORS.reset}`
				);
			}
		}
	}

	if (report.matches.length > 0) {
		console.log(`\n${COLORS.bright}${COLORS.green}--- Matching Integrations ---${COLORS.reset}`);
		console.log(`${COLORS.green}${report.matches.join(", ")}${COLORS.reset}`);
	}

	console.log(`\n${COLORS.bright}--- Summary ---${COLORS.reset}`);
	console.log(`${COLORS.green}Matching: ${report.matches.length}${COLORS.reset}`);
	console.log(`${COLORS.yellow}Backend only: ${report.backendOnly.length}${COLORS.reset}`);
	console.log(`${COLORS.yellow}Frontend only: ${report.frontendOnly.length}${COLORS.reset}`);
	console.log(`${COLORS.red}Auth mismatches: ${report.authTypeMismatches.length}${COLORS.reset}`);

	const totalMismatches = report.backendOnly.length + report.frontendOnly.length + report.authTypeMismatches.length;

	if (totalMismatches === 0) {
		console.log(`\n${COLORS.green}${COLORS.bright}All integrations match!${COLORS.reset}\n`);
	} else {
		console.log(`\n${COLORS.red}${COLORS.bright}Total mismatches: ${totalMismatches}${COLORS.reset}\n`);
	}
}

function saveJsonReport(report: ComparisonReport): void {
	const reportDir = path.dirname(path.resolve(REPORT_OUTPUT_PATH));
	if (!fs.existsSync(reportDir)) {
		fs.mkdirSync(reportDir, { recursive: true });
	}

	fs.writeFileSync(path.resolve(REPORT_OUTPUT_PATH), JSON.stringify(report, null, 2));
	console.log(`${COLORS.gray}JSON report saved to: ${REPORT_OUTPUT_PATH}${COLORS.reset}\n`);
}

function main(): void {
	console.log(`${COLORS.cyan}Parsing backend integrations...${COLORS.reset}`);
	const backendIntegrations = parseBackendIntegrations();

	console.log(`${COLORS.cyan}Parsing frontend integrations...${COLORS.reset}`);
	const frontendIntegrations = parseFrontendIntegrations();

	const report = compareIntegrations(backendIntegrations, frontendIntegrations);

	printReport(report);
	saveJsonReport(report);
}

main();
