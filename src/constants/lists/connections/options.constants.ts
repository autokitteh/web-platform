import { ConnectionAuthType } from "@enums";
import { Integrations, TriggerFormType } from "@enums/components";
import { SelectOption } from "@interfaces/components";

import {
	AwsIcon,
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

export const integrationTypes: SelectOption[] = [
	{ disabled: false, label: "Github", value: Integrations.github, icon: GithubIcon },
	{ disabled: false, label: "Slack", value: Integrations.slack, icon: SlackIcon },
	{ disabled: false, label: "AWS", value: Integrations.aws, icon: AwsIcon },
	{ disabled: false, label: "OpenAI ChatGPT", value: Integrations.chatgpt, icon: OpenAiIcon },
	{ disabled: false, label: "HTTP", value: Integrations.http, icon: HttpIcon },
	{ disabled: false, label: "Twilio", value: Integrations.twilio, icon: TwilioIcon },
	{ disabled: false, label: "Gmail", value: Integrations.gmail, icon: GoogleGmailIcon },
	{ disabled: false, label: "Jira", value: Integrations.jira, icon: JiraIcon },
	{ disabled: false, label: "Discord", value: Integrations.discord, icon: DiscordIcon },
	{ disabled: false, label: "Google (All APIs)", value: Integrations.google, icon: GoogleIcon },
	{ disabled: false, label: "Google Sheets", value: Integrations.sheets, icon: GoogleSheetsIcon },
	{ disabled: false, label: "Google Calendar", value: Integrations.calendar, icon: GoogleCalendarIcon },
	{ disabled: false, label: "Google Drive", value: Integrations.drive, icon: GoogleDriveIcon },
	{ disabled: false, label: "Google Forms", value: Integrations.forms, icon: GoogleFormsIcon },
	{ disabled: false, label: "Google Gemini", value: Integrations.googlegemini, icon: GoogleGeminiIcon },
];

export const integrationIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
	[Integrations.github]: GithubIcon,
	[Integrations.slack]: SlackIcon,
	[Integrations.aws]: AwsIcon,
	[Integrations.chatgpt]: OpenAiIcon,
	[Integrations.http]: HttpIcon,
	[Integrations.twilio]: TwilioIcon,
	[Integrations.gmail]: GoogleGmailIcon,
	[Integrations.jira]: JiraIcon,
	[Integrations.discord]: DiscordIcon,
	[Integrations.google]: GoogleIcon,
	[Integrations.sheets]: GoogleSheetsIcon,
	[Integrations.calendar]: GoogleCalendarIcon,
	[Integrations.drive]: GoogleDriveIcon,
	[Integrations.forms]: GoogleFormsIcon,
	[Integrations.googlegemini]: GoogleGeminiIcon,
};

export const triggerTypes: SelectOption[] = [
	{ disabled: false, label: "Default", value: TriggerFormType.default },
	{ disabled: false, label: "Scheduler", value: TriggerFormType.scheduler },
];

export const githubIntegrationAuthMethods: SelectOption[] = [
	{ label: "Personal Access Token (PAT)", value: ConnectionAuthType.Pat },
	{ label: "OAuth", value: ConnectionAuthType.Oauth },
];

export const selectIntegrationGoogle: SelectOption[] = [
	{ label: "Service Account (JSON Key)", value: ConnectionAuthType.JsonKey },
	{ label: "User (OAuth v2)", value: ConnectionAuthType.Oauth },
];

export const selectIntegrationSlack: SelectOption[] = [
	{ label: "Socket Mode", value: ConnectionAuthType.Socket },
	{ label: "OAuth v2", value: ConnectionAuthType.Oauth },
];

export const selectIntegrationAws: SelectOption[] = [
	{ value: "ap-northeast-1", label: "ap-northeast-1" },
	{ value: "ap-northeast-2", label: "ap-northeast-2" },
	{ value: "ap-northeast-3", label: "ap-northeast-3" },
	{ value: "ap-south-1", label: "ap-south-1" },
	{ value: "ap-southeast-1", label: "ap-southeast-1" },
	{ value: "ap-southeast-2", label: "ap-southeast-2" },
	{ value: "ca-central-1", label: "ca-central-1" },
	{ value: "eu-central-1", label: "eu-central-1" },
	{ value: "eu-north-1", label: "eu-north-1" },
	{ value: "eu-west-1", label: "eu-west-1" },
	{ value: "eu-west-2", label: "eu-west-2" },
	{ value: "eu-west-3", label: "eu-west-3" },
	{ value: "sa-east-1", label: "sa-east-1" },
	{ value: "us-east-1", label: "us-east-1" },
	{ value: "us-east-2", label: "us-east-2" },
	{ value: "us-west-1", label: "us-west-1" },
	{ value: "us-west-2", label: "us-west-2" },
];

export const selectIntegrationHttp: SelectOption[] = [
	{ label: "No Auth", value: ConnectionAuthType.NoAuth },
	{ label: "Basic", value: ConnectionAuthType.Basic, disabled: true },
	{ label: "Bearer", value: ConnectionAuthType.Bearer, disabled: true },
];

export const selectIntegrationTwilio: SelectOption[] = [
	{ label: "Auth Token", value: ConnectionAuthType.AuthToken },
	{ label: "API Key", value: ConnectionAuthType.ApiKey },
];

export const selectIntegrationJira: SelectOption[] = [
	{ label: "User API Token / PAT", value: ConnectionAuthType.ApiToken },
	{ label: "OAuth 2.0 App", value: ConnectionAuthType.Oauth },
];
