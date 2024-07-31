import {
	GithubConnectionType,
	GoogleConnectionType,
	HttpConnectionType,
	JiraConnectionType,
	SlackConnectionType,
	TwilioConnectionType,
} from "@enums";
import { Integrations, TriggerFormType } from "@enums/components";
import { SelectOption } from "@interfaces/components";

export const integrationTypes: SelectOption[] = [
	{ disabled: false, label: "Github", value: Integrations.github },
	{ disabled: false, label: "Slack", value: Integrations.slack },
	{ disabled: false, label: "AWS", value: Integrations.aws },
	{ disabled: false, label: "OpenAI ChatGPT", value: Integrations.openAi },
	{ disabled: false, label: "HTTP", value: Integrations.http },
	{ disabled: false, label: "Twilio", value: Integrations.twilio },
	{ disabled: false, label: "Gmail", value: Integrations.gmail },
	{ disabled: false, label: "Jira", value: Integrations.jira },
	{ disabled: false, label: "Discord", value: Integrations.discord },
	{ disabled: false, label: "Google (All APIs)", value: Integrations.google },
	{ disabled: false, label: "Google Sheets", value: Integrations.googleSheets },
	{ disabled: false, label: "Google Calendar", value: Integrations.googleCalendar },
	{ disabled: false, label: "Google Drive", value: Integrations.googleDrive },
	{ disabled: false, label: "Google Forms", value: Integrations.googleForms },
];

export const triggerTypes: SelectOption[] = [
	{ disabled: false, label: "Default", value: TriggerFormType.default },
	{ disabled: false, label: "Scheduler", value: TriggerFormType.scheduler },
];

export const githubIntegrationAuthMethods: SelectOption[] = [
	{ label: "Personal Access Token (PAT)", value: GithubConnectionType.Pat },
	{ label: "OAuth", value: GithubConnectionType.Oauth },
];

export const selectIntegrationGoogle: SelectOption[] = [
	{ label: "Service Account (JSON Key)", value: GoogleConnectionType.ServiceAccount },
	{ label: "User (OAuth v2)", value: GoogleConnectionType.Oauth },
];

export const selectIntegrationSlack: SelectOption[] = [
	{ label: "Socket Mode", value: SlackConnectionType.Mode },
	{ label: "OAuth v2", value: SlackConnectionType.Oauth },
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
	{ label: "No Auth", value: HttpConnectionType.NoAuth },
	{ label: "Basic", value: HttpConnectionType.Basic, disabled: true },
	{ label: "Bearer", value: HttpConnectionType.Bearer, disabled: true },
];

export const selectIntegrationTwilio: SelectOption[] = [
	{ label: "Auth Token", value: TwilioConnectionType.AuthToken },
	{ label: "API Key", value: TwilioConnectionType.ApiKey },
];

export const selectIntegrationJira: SelectOption[] = [
	{ label: "User API Token / PAT", value: JiraConnectionType.ApiToken },
	{ label: "OAuth 2.0 App", value: JiraConnectionType.Oauth },
];
