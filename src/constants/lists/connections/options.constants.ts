import { GithubConnectionType } from "@enums/components";
import { SelectOption } from "@interfaces/components";

export const selectConnectionApp: SelectOption[] = [{ value: "github", label: "Github", disabled: false }];

export const selectIntegrationGithub: SelectOption[] = [
	{ value: GithubConnectionType.PAT, label: "OAuth" },
	{ value: GithubConnectionType.OAUTH, label: "Personal Access Token (PAT)" },
];
