import { GithubConnectionType, GoogleConnectionType, SlackConnectionType } from "@enums";
import { SelectOption } from "@interfaces/components";

export const selectIntegrations: SelectOption[] = [
	{ value: "github", label: "Github", disabled: false },
	{ value: "google", label: "Google (All APIs)", disabled: false },
	{ value: "slack", label: "Slack", disabled: false },
];

export const selectIntegrationGithub: SelectOption[] = [
	{ value: GithubConnectionType.Pat, label: "Personal Access Token (PAT)" },
	{ value: GithubConnectionType.Oauth, label: "OAuth" },
];

export const selectIntegrationGoogle: SelectOption[] = [
	{ value: GoogleConnectionType.Oauth, label: "User (OAuth v2)" },
	{ value: GoogleConnectionType.ServiceAccount, label: "Service Account (JSON Key)" },
];

export const selectIntegrationSlack: SelectOption[] = [
	{ value: SlackConnectionType.Mode, label: "Socket Mode" },
	{ value: SlackConnectionType.Oauth, label: "OAuth v2" },
];
