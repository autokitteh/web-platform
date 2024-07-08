import { GithubConnectionType, GoogleConnectionType } from "@enums";
import { TriggerFormType } from "@enums/components";
import { SelectOption } from "@interfaces/components";

export const integrationTypes: SelectOption[] = [
	{ disabled: false, label: "Github", value: "github" },
	{ disabled: false, label: "Google (All APIs)", value: "google" },
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
	{ label: "User (OAuth v2)", value: GoogleConnectionType.Oauth },
	{ label: "Service Account (JSON Key)", value: GoogleConnectionType.ServiceAccount },
];
