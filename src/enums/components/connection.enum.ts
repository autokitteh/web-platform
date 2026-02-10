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
	KubernetesIcon,
	AnthropicIcon,
	RedditIcon,
	PipedriveIcon,
	NotionIcon,
} from "@assets/image/icons/connections";

export enum Integrations {
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
	pydanticgw = "pydanticgw",
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
	anthropic: {
		icon: AnthropicIcon,
		label: "Anthropic",
		value: Integrations.anthropic,
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
	kubernetes: {
		icon: KubernetesIcon,
		label: "Kubernetes",
		value: Integrations.kubernetes,
	},
	reddit: {
		icon: RedditIcon,
		label: "Reddit",
		value: Integrations.reddit,
	},
	pipedrive: {
		icon: PipedriveIcon,
		label: "Pipedrive",
		value: Integrations.pipedrive,
	},
	notion: {
		icon: NotionIcon,
		label: "Notion",
		value: Integrations.notion,
	},
	pydanticgw: {
		icon: HttpIcon,
		label: "Pydantic Gateway",
		value: Integrations.pydanticgw,
	},
};

const shouldHideIntegration: Partial<Record<Integrations, boolean>> = {
	[Integrations.telegram]: featureFlags.telegramHideIntegration,
	[Integrations.pipedrive]: featureFlags.pipedriveHideIntegration,
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
