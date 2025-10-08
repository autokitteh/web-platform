import { featureFlags } from "@src/constants";
import { IntegrationSelectOption } from "@src/interfaces/components/forms";
import { GoogleIntegrationType } from "@src/types/components/googleIntegration.type";

import { AKRoundLogo } from "@assets/image";
import {
	AsanaIcon,
	Auth0Icon,
	AwsIcon,
	ConfluenceIcon,
	DiscordIcon,
	GithubCopilotIcon,
	GithubIcon,
	GoogleCalendarIcon,
	GoogleDriveIcon,
	GoogleFormsIcon,
	GoogleGeminiIcon,
	GoogleGmailIcon,
	GoogleSheetsIcon,
	GoogleYoutubeIcon,
	GrpcIcon,
	HttpIcon,
	HubspotIcon,
	JiraIcon,
	LinearIcon,
	OpenAiIcon,
	SchedulerIcon,
	SlackIcon,
	SqliteIcon,
	TwilioIcon,
	TelegramIcon,
	ZoomIcon,
	SalesforceIcon,
	MicrosoftTeamsIcon,
	AzureBotIcon,
} from "@assets/image/icons/connections";

export enum ConnectionStatus {
	error = 3,
	ok = 1,
	unspecified = 0,
	warning = 2,
}

export enum Integrations {
	asana = "asana",
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
	height = "height",
	zoom = "zoom",
	linear = "linear",
	salesforce = "salesforce",
	// eslint-disable-next-line @typescript-eslint/naming-convention
	microsoft_teams = "microsoft_teams",
	azurebot = "azurebot",
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

export const IntegrationsMap: Record<Integrations, IntegrationSelectOption> = {
	linear: {
		icon: LinearIcon,
		label: "Linear",
		value: Integrations.linear,
	},
	auth0: {
		icon: Auth0Icon,
		label: "Auth0",
		value: Integrations.auth0,
	},
	asana: {
		icon: AsanaIcon,
		label: "Asana",
		value: Integrations.asana,
	},
	aws: {
		icon: AwsIcon,
		label: "AWS",
		value: Integrations.aws,
	},
	calendar: {
		icon: GoogleCalendarIcon,
		label: "Google Calendar",
		value: Integrations.calendar,
	},
	chatgpt: {
		icon: OpenAiIcon,
		label: "OpenAI ChatGPT",
		value: Integrations.chatgpt,
	},
	confluence: {
		icon: ConfluenceIcon,
		label: "Atlassian Confluence",
		value: Integrations.confluence,
	},
	discord: {
		icon: DiscordIcon,
		label: "Discord",
		value: Integrations.discord,
	},
	drive: {
		icon: GoogleDriveIcon,
		label: "Google Drive",
		value: Integrations.drive,
	},
	forms: {
		icon: GoogleFormsIcon,
		label: "Google Forms",
		value: Integrations.forms,
	},
	github: {
		icon: GithubIcon,
		label: "GitHub",
		value: Integrations.github,
	},
	gmail: {
		icon: GoogleGmailIcon,
		label: "Gmail",
		value: Integrations.gmail,
	},
	youtube: {
		icon: GoogleYoutubeIcon,
		label: "YouTube",
		value: Integrations.youtube,
	},
	googlegemini: {
		icon: GoogleGeminiIcon,
		label: "Google Gemini",
		value: Integrations.googlegemini,
	},
	jira: {
		icon: JiraIcon,
		label: "Atlassian Jira",
		value: Integrations.jira,
	},
	sheets: {
		icon: GoogleSheetsIcon,
		label: "Google Sheets",
		value: Integrations.sheets,
	},
	slack: {
		icon: SlackIcon,
		label: "Slack",
		value: Integrations.slack,
	},
	twilio: {
		icon: TwilioIcon,
		label: "Twilio",
		value: Integrations.twilio,
	},
	telegram: {
		icon: TelegramIcon,
		label: "Telegram",
		value: Integrations.telegram,
	},
	hubspot: {
		icon: HubspotIcon,
		label: "HubSpot",
		value: Integrations.hubspot,
	},
	height: {
		icon: ZoomIcon,
		label: "Height",
		value: Integrations.height,
	},
	zoom: {
		icon: ZoomIcon,
		label: "Zoom",
		value: Integrations.zoom,
	},
	salesforce: {
		icon: SalesforceIcon,
		label: "Salesforce",
		value: Integrations.salesforce,
	},
	microsoft_teams: {
		icon: MicrosoftTeamsIcon,
		label: "Microsoft Teams",
		value: Integrations.microsoft_teams,
	},
	azurebot: {
		icon: AzureBotIcon,
		label: "Azure Bot",
		value: Integrations.azurebot,
	},
};

const shouldHideIntegration: Partial<Record<Integrations, boolean>> = {
	[Integrations.discord]: !featureFlags.displayDiscordIntegration,
	[Integrations.microsoft_teams]: featureFlags.microsoftHideIntegration,
	[Integrations.telegram]: featureFlags.telegramHideIntegration,
};

export const fitleredIntegrationsMap = Object.fromEntries(
	Object.entries(IntegrationsMap).filter(([key]) => !shouldHideIntegration[key as Integrations])
) as Record<Integrations, IntegrationSelectOption>;

export const HiddenIntegrationsForTemplates: Record<IntegrationForTemplates, IntegrationSelectOption> = {
	githubcopilot: { label: "GitHub Copilot", value: IntegrationForTemplates.githubcopilot, icon: GithubCopilotIcon },
	sqlite3: { label: "SQLite", value: IntegrationForTemplates.sqlite3, icon: SqliteIcon },
	scheduler: { label: "Scheduler", value: IntegrationForTemplates.scheduler, icon: SchedulerIcon },
	http: { label: "HTTP", value: IntegrationForTemplates.http, icon: HttpIcon },
	autokitteh: { label: "AutoKitteh", value: IntegrationForTemplates.autokitteh, icon: AKRoundLogo },
	grpc: { label: "gRPC", value: IntegrationForTemplates.grpc, icon: GrpcIcon },
};
