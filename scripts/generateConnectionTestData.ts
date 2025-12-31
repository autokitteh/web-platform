/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, "../e2e/fixtures/connectionsTestCases.json");

interface SelectOption {
	disabled?: boolean;
	label: string;
	value: string;
}

interface IntegrationConfig {
	label: string;
	value: string;
}

enum ConnectionAuthType {
	ApiKey = "apiKey",
	ApiToken = "apiToken",
	AuthToken = "authToken",
	Basic = "basic",
	Bearer = "bearer",
	DaemonApp = "daemonApp",
	Json = "json",
	NoAuth = "noAuth",
	Oauth = "oauth",
	OauthDefault = "oauthDefault",
	OauthPrivate = "oauthPrivate",
	Pat = "pat",
	serverToServer = "serverToServer",
	Socket = "socket",
}

enum Integrations {
	asana = "asana",
	anthropic = "anthropic",
	auth0 = "auth0",
	github = "github",
	slack = "slack",
	gmail = "gmail",
	sheets = "sheets",
	calendar = "calendar",
	drive = "drive",
	forms = "forms",
	googlegemini = "googlegemini",
	aws = "aws",
	twilio = "twilio",
	telegram = "telegram",
	jira = "jira",
	discord = "discord",
	chatgpt = "chatgpt",
	confluence = "confluence",
	hubspot = "hubspot",
	youtube = "youtube",
	zoom = "zoom",
	linear = "linear",
	salesforce = "salesforce",
	microsoft_teams = "microsoft_teams",
	kubernetes = "kubernetes",
	reddit = "reddit",
	pipedrive = "pipedrive",
	notion = "notion",
}

const IntegrationsMap: Record<Integrations, IntegrationConfig> = {
	linear: { label: "Linear", value: Integrations.linear },
	auth0: { label: "Auth0", value: Integrations.auth0 },
	asana: { label: "Asana", value: Integrations.asana },
	anthropic: { label: "Anthropic", value: Integrations.anthropic },
	aws: { label: "AWS", value: Integrations.aws },
	calendar: { label: "Google Calendar", value: Integrations.calendar },
	chatgpt: { label: "OpenAI ChatGPT", value: Integrations.chatgpt },
	confluence: { label: "Atlassian Confluence", value: Integrations.confluence },
	discord: { label: "Discord", value: Integrations.discord },
	drive: { label: "Google Drive", value: Integrations.drive },
	forms: { label: "Google Forms", value: Integrations.forms },
	github: { label: "GitHub", value: Integrations.github },
	gmail: { label: "Gmail", value: Integrations.gmail },
	youtube: { label: "YouTube", value: Integrations.youtube },
	googlegemini: { label: "Google Gemini", value: Integrations.googlegemini },
	jira: { label: "Atlassian Jira", value: Integrations.jira },
	sheets: { label: "Google Sheets", value: Integrations.sheets },
	slack: { label: "Slack", value: Integrations.slack },
	twilio: { label: "Twilio", value: Integrations.twilio },
	telegram: { label: "Telegram", value: Integrations.telegram },
	hubspot: { label: "HubSpot", value: Integrations.hubspot },
	zoom: { label: "Zoom", value: Integrations.zoom },
	salesforce: { label: "Salesforce", value: Integrations.salesforce },
	microsoft_teams: { label: "Microsoft Teams", value: Integrations.microsoft_teams },
	kubernetes: { label: "Kubernetes", value: Integrations.kubernetes },
	reddit: { label: "Reddit", value: Integrations.reddit },
	pipedrive: { label: "Pipedrive", value: Integrations.pipedrive },
	notion: { label: "Notion", value: Integrations.notion },
};

const shouldHideIntegration: Partial<Record<Integrations, boolean>> = {
	[Integrations.telegram]: Boolean(process.env.VITE_TELEGRAM_HIDE_INTEGRATION),
	[Integrations.pipedrive]: Boolean(process.env.VITE_PIPEDRIVE_HIDE_INTEGRATION),
};

const githubIntegrationAuthMethods: SelectOption[] = [
	{ label: "OAuth v2 - Default app", value: ConnectionAuthType.Oauth },
	{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault },
	{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
	{ label: "PAT + Webhook", value: ConnectionAuthType.Pat },
];

const linearIntegrationAuthMethods: SelectOption[] = [
	{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault },
	{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
	{ label: "API Key", value: ConnectionAuthType.ApiKey },
];

const salesforceIntegrationAuthMethods: SelectOption[] = [
	{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault },
	{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
];

const zoomIntegrationAuthMethods: SelectOption[] = [
	{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault },
	{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
	{ label: "Private Server-to-Server", value: ConnectionAuthType.serverToServer },
];

const selectIntegrationGoogle: SelectOption[] = [
	{ label: "User (OAuth 2.0)", value: ConnectionAuthType.Oauth },
	{ label: "Service Account (JSON Key)", value: ConnectionAuthType.Json },
];

const selectIntegrationSlack: SelectOption[] = [
	{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault },
	{ label: "OAuth v2 - Private app", value: ConnectionAuthType.OauthPrivate },
];

const microsoftTeamsIntegrationAuthMethods: SelectOption[] = [
	{ label: "Default user-delegated app", value: ConnectionAuthType.OauthDefault },
	{ label: "Private user-delegated app", value: ConnectionAuthType.OauthPrivate },
	{ label: "Private daemon application", value: ConnectionAuthType.DaemonApp },
];

const selectIntegrationTwilio: SelectOption[] = [{ label: "API Token", value: ConnectionAuthType.ApiToken }];

const selectIntegrationJira: SelectOption[] = [
	{ label: "OAuth 2.0 App", value: ConnectionAuthType.Oauth },
	{ label: "User API Token / PAT", value: ConnectionAuthType.ApiToken },
];

const selectIntegrationConfluence: SelectOption[] = [
	{ label: "OAuth 2.0 App", value: ConnectionAuthType.Oauth },
	{ label: "User API Token / PAT", value: ConnectionAuthType.ApiToken },
];

const notionIntegrationAuthMethods: SelectOption[] = [
	{ label: "OAuth v2 - Default app", value: ConnectionAuthType.OauthDefault },
	{ label: "API Key", value: ConnectionAuthType.ApiKey },
];

const integrationAuthMethodsMap: Partial<Record<string, SelectOption[]>> = {
	[Integrations.github]: githubIntegrationAuthMethods,
	[Integrations.linear]: linearIntegrationAuthMethods,
	[Integrations.salesforce]: salesforceIntegrationAuthMethods,
	[Integrations.zoom]: zoomIntegrationAuthMethods,
	[Integrations.slack]: selectIntegrationSlack,
	[Integrations.microsoft_teams]: microsoftTeamsIntegrationAuthMethods,
	[Integrations.twilio]: selectIntegrationTwilio,
	[Integrations.jira]: selectIntegrationJira,
	[Integrations.confluence]: selectIntegrationConfluence,
	[Integrations.notion]: notionIntegrationAuthMethods,
	[Integrations.gmail]: selectIntegrationGoogle,
	[Integrations.sheets]: selectIntegrationGoogle,
	[Integrations.calendar]: selectIntegrationGoogle,
	[Integrations.drive]: selectIntegrationGoogle,
	[Integrations.forms]: selectIntegrationGoogle,
	[Integrations.youtube]: selectIntegrationGoogle,
};

function main() {
	console.log("🔄 Generating connection test data from source constants...\n");

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

		const authMethods = integrationAuthMethodsMap[integration] || [];
		const enabledAuthMethods = authMethods.filter((method) => !method.disabled);

		const seenLabels = new Set<string>();
		const uniqueAuthMethods = enabledAuthMethods.filter((method) => {
			if (seenLabels.has(method.label)) {
				return false;
			}
			seenLabels.add(method.label);
			return true;
		});

		if (uniqueAuthMethods.length === 0) {
			testCases.push({
				testName: `${config.label} (no auth types)`,
				integration: config.value,
				label: config.label,
				authType: null,
				authLabel: null,
				category: "single-type",
			});
		} else if (uniqueAuthMethods.length === 1) {
			const authConfig = uniqueAuthMethods[0];
			testCases.push({
				testName: `${config.label} - ${authConfig.label}`,
				integration: config.value,
				label: config.label,
				authType: authConfig.value,
				authLabel: authConfig.label,
				category: "single-type",
			});
		} else {
			for (const authConfig of uniqueAuthMethods) {
				testCases.push({
					testName: `${config.label} - ${authConfig.label}`,
					integration: config.value,
					label: config.label,
					authType: authConfig.value,
					authLabel: authConfig.label,
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
	console.log(`   Source: Local definitions mirroring src/ constants`);
	console.log(`   Output: ${OUTPUT_PATH}\n`);
}

main();
