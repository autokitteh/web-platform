import { Integrations, IntegrationsMap } from "@src/enums/components/integrations.enum";
import { IntegrationSelectOption } from "@src/interfaces/components/forms";

export const sortIntegrationsMapByLabel = (
	map: typeof IntegrationsMap
): Record<Integrations, IntegrationSelectOption> => {
	const entries = Object.entries(map);
	const sortedEntries = entries.sort((a, b) => a[1].label.localeCompare(b[1].label));
	const sortedMap = Object.fromEntries(sortedEntries);

	return sortedMap as Record<Integrations, IntegrationSelectOption>;
};
