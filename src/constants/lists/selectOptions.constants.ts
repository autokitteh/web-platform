import { SelectOption } from "@interfaces/components";

export const optionsSelectApp: SelectOption[] = [{ value: "github", label: "Github", disabled: false }];

export const selectIntegrationGithub: SelectOption[] = [
	{ value: "pat", label: "User (PAT)" },
	{ value: "app", label: "GitHub App" },
];
