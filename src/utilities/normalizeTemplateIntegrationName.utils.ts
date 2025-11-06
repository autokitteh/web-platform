import { Integrations } from "@src/enums/components";

const googlePrefix = "google";
const googlePrefixLength = googlePrefix.length;

export const normalizeTemplateIntegrationName = (integrationName: string): string => {
	if (!integrationName?.trim()) return integrationName;

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
			return normalizedName;
		}
	}

	return integrationName;
};
