import { IntegrationSelectOption } from "@src/interfaces/components/forms";

import {
	AwsIcon,
	ConfluenceIcon,
	DiscordIcon,
	GithubIcon,
	GoogleCalendarIcon,
	GoogleDriveIcon,
	GoogleFormsIcon,
	GoogleGeminiIcon,
	GoogleGmailIcon,
	GoogleIcon,
	GoogleSheetsIcon,
	HttpIcon,
	JiraIcon,
	OpenAiIcon,
	SlackIcon,
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
	google = "google",
	sheets = "sheets",
	calendar = "calendar",
	drive = "drive",
	forms = "forms",
	googlegemini = "googlegemini",
	aws = "aws",
	http = "http",
	twilio = "twilio",
	jira = "jira",
	discord = "discord",
	chatgpt = "chatgpt",
	confluence = "confluence",
}

export const IntegrationsMap: Record<string, IntegrationSelectOption> = {
	github: { label: "GitHub", value: "github", icon: GithubIcon },
	slack: { label: "Slack", value: "slack", icon: SlackIcon },
	aws: { label: "AWS", value: "aws", icon: AwsIcon },
	chatgpt: { label: "OpenAI ChatGPT", value: "chatgpt", icon: OpenAiIcon },
	twilio: { label: "Twilio", value: "twilio", icon: TwilioIcon },
	gmail: { label: "Gmail", value: "gmail", icon: GoogleGmailIcon },
	jira: { label: "Jira", value: "jira", icon: JiraIcon },
	confluence: { label: "Atlassian Confluence", value: "confluence", icon: ConfluenceIcon },
	discord: { label: "Discord", value: "discord", icon: DiscordIcon },
	google: { label: "Google (All APIs)", value: "google", icon: GoogleIcon },
	sheets: { label: "Google Sheets", value: "sheets", icon: GoogleSheetsIcon },
	calendar: { label: "Google Calendar", value: "calendar", icon: GoogleCalendarIcon },
	drive: { label: "Google Drive", value: "drive", icon: GoogleDriveIcon },
	forms: { label: "Google Forms", value: "forms", icon: GoogleFormsIcon },
	googlegemini: { label: "Google Gemini", value: "googlegemini", icon: GoogleGeminiIcon },
	http: { label: "HTTP", value: "http", icon: HttpIcon },
};
