import { GithubConnectionType, GoogleConnectionType } from "@enums";
import { SelectOption } from "@interfaces/components";

export const selectIntegrations: SelectOption[] = [
	{ value: "github", label: "Github", disabled: false },
	{ value: "google", label: "Google (All APIs)", disabled: false },
	{ value: "googleSheets", label: "Google Sheets", disabled: false },
];

export const selectIntegrationGithub: SelectOption[] = [
	{ value: GithubConnectionType.Pat, label: "Personal Access Token (PAT)" },
	{ value: GithubConnectionType.Oauth, label: "OAuth" },
];

export const selectIntegrationGoogle: SelectOption[] = [
	{ value: GoogleConnectionType.Oauth, label: "User (OAuth v2)" },
	{ value: GoogleConnectionType.ServiceAccount, label: "Service Account (JSON Key)" },
];
