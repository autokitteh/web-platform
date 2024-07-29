import { GithubConnectionType, GoogleConnectionType, SlackConnectionType } from "@enums";
import { TriggerFormType } from "@enums/components";
import { SelectOption } from "@interfaces/components";

export const integrationTypes: SelectOption[] = [
	{ disabled: false, label: "Github", value: "github" },
	{ disabled: false, label: "Slack", value: "slack" },
	{ disabled: false, label: "Gmail", value: "gmail" },
	{ disabled: false, label: "Google (All APIs)", value: "google" },
	{ disabled: false, label: "Google Sheets", value: "googleSheets" },
	{ disabled: false, label: "Google Calendar", value: "googleCalendar" },
	{ disabled: false, label: "Google Drive", value: "googleDrive" },
	{ disabled: false, label: "Google Forms", value: "googleForms" },
	{ disabled: false, label: "AWS", value: "aws" },
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
