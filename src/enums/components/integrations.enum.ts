import { featureFlags } from "../../constants/featureFlags.constants";
import { BaseSelectOption } from "../../interfaces/components/forms/select.interface";
import { GoogleIntegrationType } from "../../types/components/googleIntegration.type";

export enum Integrations {
	airtable = "airtable",
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
	// eslint-disable-next-line @typescript-eslint/naming-convention
	microsoft_teams = "microsoft_teams",
	kubernetes = "kubernetes",
	reddit = "reddit",
	pipedrive = "pipedrive",
	notion = "notion",
}

export enum ConnectionStatus {
	error = 3,
	ok = 1,
	unspecified = 0,
	warning = 2,
}

export const defaultGoogleConnectionName = "google";
export const defaultMicrosoftConnectionName = "microsoft";
export const defaultAtlassianConnectionName = "atlassian";

export function isGoogleIntegration(integration: Integrations): integration is GoogleIntegrationType {
	return [
		Integrations.gmail,
		Integrations.sheets,
		Integrations.calendar,
		Integrations.drive,
		Integrations.forms,
		Integrations.youtube,
	].includes(integration);
}

export function isMicrosoftIntegration(integration: Integrations) {
	return [Integrations.microsoft_teams].includes(integration);
}

export function isLegacyIntegration(integration: Integrations) {
	return [Integrations.github, Integrations.jira, Integrations.confluence, Integrations.hubspot].includes(
		integration
	);
}

export function isMicrosofIntegration(integration: Integrations) {
	return [Integrations.microsoft_teams].includes(integration);
}

export function hasLegacyConnectionType(integration: Integrations): boolean {
	return [Integrations.github, Integrations.slack].includes(integration);
}

export enum IntegrationForTemplates {
	githubcopilot = "githubcopilot",
	sqlite3 = "sqlite3",
	scheduler = "scheduler",
	http = "http",
	autokitteh = "autokitteh",
	grpc = "grpc",
}

export const IntegrationsMap: Record<Integrations, BaseSelectOption> = {
	linear: {
		label: "Linear",
		value: Integrations.linear,
	},
	airtable: {
		label: "Airtable",
		value: Integrations.airtable,
	},
	auth0: {
		label: "Auth0",
		value: Integrations.auth0,
	},
	asana: {
		label: "Asana",
		value: Integrations.asana,
	},
	anthropic: {
		label: "Anthropic",
		value: Integrations.anthropic,
	},
	aws: {
		label: "AWS",
		value: Integrations.aws,
	},
	calendar: {
		label: "Google Calendar",
		value: Integrations.calendar,
	},
	chatgpt: {
		label: "OpenAI ChatGPT",
		value: Integrations.chatgpt,
	},
	confluence: {
		label: "Atlassian Confluence",
		value: Integrations.confluence,
	},
	discord: {
		label: "Discord",
		value: Integrations.discord,
	},
	drive: {
		label: "Google Drive",
		value: Integrations.drive,
	},
	forms: {
		label: "Google Forms",
		value: Integrations.forms,
	},
	github: {
		label: "GitHub",
		value: Integrations.github,
	},
	gmail: {
		label: "Gmail",
		value: Integrations.gmail,
	},
	youtube: {
		label: "YouTube",
		value: Integrations.youtube,
	},
	googlegemini: {
		label: "Google Gemini",
		value: Integrations.googlegemini,
	},
	jira: {
		label: "Atlassian Jira",
		value: Integrations.jira,
	},
	sheets: {
		label: "Google Sheets",
		value: Integrations.sheets,
	},
	slack: {
		label: "Slack",
		value: Integrations.slack,
	},
	twilio: {
		label: "Twilio",
		value: Integrations.twilio,
	},
	telegram: {
		label: "Telegram",
		value: Integrations.telegram,
	},
	hubspot: {
		label: "HubSpot",
		value: Integrations.hubspot,
	},
	zoom: {
		label: "Zoom",
		value: Integrations.zoom,
	},
	salesforce: {
		label: "Salesforce",
		value: Integrations.salesforce,
	},
	microsoft_teams: {
		label: "Microsoft Teams",
		value: Integrations.microsoft_teams,
	},
	kubernetes: {
		label: "Kubernetes",
		value: Integrations.kubernetes,
	},
	reddit: {
		label: "Reddit",
		value: Integrations.reddit,
	},
	pipedrive: {
		label: "Pipedrive",
		value: Integrations.pipedrive,
	},
	notion: {
		label: "Notion",
		value: Integrations.notion,
	},
};

export const HiddenIntegrationsForTemplates: Record<IntegrationForTemplates, BaseSelectOption> = {
	githubcopilot: { label: "GitHub Copilot", value: IntegrationForTemplates.githubcopilot },
	sqlite3: { label: "SQLite", value: IntegrationForTemplates.sqlite3 },
	scheduler: { label: "Scheduler", value: IntegrationForTemplates.scheduler },
	http: { label: "HTTP", value: IntegrationForTemplates.http },
	autokitteh: { label: "AutoKitteh", value: IntegrationForTemplates.autokitteh },
	grpc: { label: "gRPC", value: IntegrationForTemplates.grpc },
};

export const shouldHideIntegration: Partial<Record<Integrations, boolean>> = {
	[Integrations.telegram]: featureFlags.telegramHideIntegration,
	[Integrations.pipedrive]: featureFlags.pipedriveHideIntegration,
};

export const fitleredIntegrationsMap = Object.fromEntries(
	Object.entries(IntegrationsMap).filter(([key]) => !shouldHideIntegration[key as Integrations])
) as Record<Integrations, BaseSelectOption>;
