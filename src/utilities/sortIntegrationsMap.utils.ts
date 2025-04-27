import { Integrations, IntegrationsMap } from "@enums/components/connection.enum";
import { IntegrationSelectOption } from "@interfaces/components/forms";

export const sortIntegrationsMapByLabel = (
	map: typeof IntegrationsMap
): Record<Integrations, IntegrationSelectOption> => {
	const entries = Object.entries(map);
	const sortedEntries = entries.sort((a, b) => a[1].label.localeCompare(b[1].label));
	const sortedMap = Object.fromEntries(sortedEntries);

	return sortedMap as Record<Integrations, IntegrationSelectOption>;
};
