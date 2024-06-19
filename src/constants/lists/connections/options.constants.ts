import { GithubConnectionType, GoogleConnectionType } from "@enums";
import { TriggerFormType } from "@enums/components";
import { SelectOption } from "@interfaces/components";

export const integrationTypes: SelectOption[] = [
	{ value: "github", label: "Github", disabled: false },
	{ value: "google", label: "Google (All APIs)", disabled: false },
];

export const selectTriggerType: SelectOption[] = [
	{ value: TriggerFormType.default, label: "Default", disabled: false },
	{ value: TriggerFormType.scheduler, label: "Scheduler", disabled: false },
];

export const githubIntegrationAuthMethods: SelectOption[] = [
	{ value: GithubConnectionType.Pat, label: "Personal Access Token (PAT)" },
	{ value: GithubConnectionType.Oauth, label: "OAuth" },
];

export const selectIntegrationGoogle: SelectOption[] = [
	{ value: GoogleConnectionType.Oauth, label: "User (OAuth v2)" },
	{ value: GoogleConnectionType.ServiceAccount, label: "Service Account (JSON Key)" },
];
