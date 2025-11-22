import { Integrations } from "@src/enums/components";

const googlePrefix = "google";
const googlePrefixLength = googlePrefix.length;

export const normalizeTemplateIntegrationName = (integrationName: string): keyof typeof Integrations | undefined => {
	if (!integrationName?.trim() || !(integrationName.trim() in Integrations)) return undefined;

	const lowerName = integrationName.toLowerCase();

	if (lowerName.startsWith(googlePrefix) && integrationName.length > googlePrefixLength) {
		const withoutGoogle = integrationName.slice(googlePrefixLength);
		const normalizedName = withoutGoogle.toLowerCase();

		if (
			normalizedName === Integrations.calendar ||
			normalizedName === Integrations.gmail ||
			normalizedName === Integrations.sheets ||
			normalizedName === Integrations.drive ||
			normalizedName === Integrations.forms ||
			normalizedName === Integrations.youtube
		) {
			return normalizedName as keyof typeof Integrations;
		}
	}

	return integrationName as keyof typeof Integrations;
};
