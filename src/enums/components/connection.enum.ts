import { IntegrationSelectOption } from "@src/interfaces/components/forms";

import { AKRoundLogo } from "@assets/image";
import {
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
	github: { label: "GitHub", value: Integrations.github, icon: GithubIcon },
	slack: { label: "Slack", value: Integrations.slack, icon: SlackIcon },
	aws: { label: "AWS", value: Integrations.aws, icon: AwsIcon },
	chatgpt: { label: "OpenAI ChatGPT", value: Integrations.chatgpt, icon: OpenAiIcon },
	twilio: { label: "Twilio", value: Integrations.twilio, icon: TwilioIcon },
	gmail: { label: "Gmail", value: Integrations.gmail, icon: GoogleGmailIcon },
	jira: { label: "Jira", value: Integrations.jira, icon: JiraIcon },
	confluence: { label: "Atlassian Confluence", value: Integrations.confluence, icon: ConfluenceIcon },
	discord: { label: "Discord", value: Integrations.discord, icon: DiscordIcon },
	sheets: { label: "Google Sheets", value: Integrations.sheets, icon: GoogleSheetsIcon },
	calendar: { label: "Google Calendar", value: Integrations.calendar, icon: GoogleCalendarIcon },
	drive: { label: "Google Drive", value: Integrations.drive, icon: GoogleDriveIcon },
	forms: { label: "Google Forms", value: Integrations.forms, icon: GoogleFormsIcon },
	googlegemini: { label: "Google Gemini", value: Integrations.googlegemini, icon: GoogleGeminiIcon },
};

export const HiddenIntegrationsForTemplates: Record<IntegrationForTemplates, IntegrationSelectOption> = {
	githubcopilot: { label: "GitHub Copilot", value: IntegrationForTemplates.githubcopilot, icon: GithubCopilotIcon },
	sqlite3: { label: "SQLite", value: IntegrationForTemplates.sqlite3, icon: SqliteIcon },
	scheduler: { label: "Scheduler", value: IntegrationForTemplates.scheduler, icon: SchedulerIcon },
	http: { label: "HTTP", value: IntegrationForTemplates.http, icon: HttpIcon },
	autokitteh: { label: "AutoKitteh", value: IntegrationForTemplates.autokitteh, icon: AKRoundLogo },
	grpc: { label: "gRPC", value: IntegrationForTemplates.grpc, icon: GrpcIcon },
};
