import { GithubConnectionType } from "@enums";
import { SelectOption } from "@interfaces/components";

export const selectConnectionApp: SelectOption[] = [{ value: "github", label: "Github", disabled: false }];

export const selectIntegrationGithub: SelectOption[] = [
	{ value: GithubConnectionType.PAT, label: "Personal Access Token (PAT)" },
	{ value: GithubConnectionType.OAuth, label: "OAuth" },
];
