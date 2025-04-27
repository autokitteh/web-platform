import { Integrations } from "@enums/components";

export const integrationsCustomOAuthPaths: Partial<Record<keyof typeof Integrations, string>> = {
	github: "custom-oauth",
};
