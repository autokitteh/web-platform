import { GithubConnectionType, GoogleConnectionType } from "@enums";
import { Integrations } from "@enums/components";
import { SelectOption } from "@interfaces/components";

export const selectIntegrations: SelectOption[] = [
	{ value: Integrations.github, label: "Github", disabled: false },
	{ value: Integrations.google, label: "Google (All APIs)", disabled: false },
	{ value: Integrations.chatGpt, label: "OpenAI ChatGPT", disabled: false },
];

export const selectIntegrationGithub: SelectOption[] = [
	{ value: GithubConnectionType.Pat, label: "Personal Access Token (PAT)" },
	{ value: GithubConnectionType.Oauth, label: "OAuth" },
];

export const selectIntegrationGoogle: SelectOption[] = [
	{ value: GoogleConnectionType.Oauth, label: "User (OAuth v2)" },
	{ value: GoogleConnectionType.ServiceAccount, label: "Service Account (JSON Key)" },
];
