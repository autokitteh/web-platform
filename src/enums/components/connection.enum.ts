import { featureFlags } from "@src/constants";
import { IntegrationSelectOption } from "@src/interfaces/components/forms";

import { AKRoundLogo } from "@assets/image";
import {
	AsanaIcon,
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
	GrpcIcon,
	HttpIcon,
	JiraIcon,
	OpenAiIcon,
	SchedulerIcon,
	SlackIcon,
	SqliteIcon,
	TwilioIcon,
} from "@assets/image/icons/connections";

export enum ConnectionStatus {
	error = 3,
	ok = 1,
	unspecified = 0,
	warning = 2,
}

export enum Integrations {
	asana = "asana",
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
	jira = "jira",
	discord = "discord",
	chatgpt = "chatgpt",
	confluence = "confluence",
}

export type GoogleIntegrationType = Extract<
	Integrations,
	Integrations.gmail | Integrations.sheets | Integrations.calendar | Integrations.drive | Integrations.forms
>;

export const defaultGoogleConnectionName = "google";

export function isGoogleIntegration(integration: Integrations): integration is GoogleIntegrationType {
	return [
		Integrations.gmail,
		Integrations.sheets,
		Integrations.calendar,
		Integrations.drive,
		Integrations.forms,
	].includes(integration);
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
	googlegemini: {
		icon: GoogleGeminiIcon,
		label: "Google Gemini",
		value: Integrations.googlegemini,
	},
	jira: {
		icon: JiraIcon,
		label: "Jira",
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
};

export const fitleredIntegrationsMap = (() => {
	return Object.fromEntries(
		Object.entries(IntegrationsMap).filter(
			([key]) => key !== Integrations.discord || featureFlags.displayDiscordIntegration
		)
	) as Record<Integrations, IntegrationSelectOption>;
})();

export const HiddenIntegrationsForTemplates: Record<IntegrationForTemplates, IntegrationSelectOption> = {
	githubcopilot: { label: "GitHub Copilot", value: IntegrationForTemplates.githubcopilot, icon: GithubCopilotIcon },
	sqlite3: { label: "SQLite", value: IntegrationForTemplates.sqlite3, icon: SqliteIcon },
	scheduler: { label: "Scheduler", value: IntegrationForTemplates.scheduler, icon: SchedulerIcon },
	http: { label: "HTTP", value: IntegrationForTemplates.http, icon: HttpIcon },
	autokitteh: { label: "AutoKitteh", value: IntegrationForTemplates.autokitteh, icon: AKRoundLogo },
	grpc: { label: "gRPC", value: IntegrationForTemplates.grpc, icon: GrpcIcon },
};
