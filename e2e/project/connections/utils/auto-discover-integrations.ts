/* eslint-disable unicorn/filename-case */
import { allConnectionsAuthTypes } from "@src/constants/connections/integrationAuthMethods.constants";
import { Integrations, IntegrationsMap, shouldHideIntegration } from "@src/enums/components/integrations.enum";

export interface DiscoveredTestCase {
	category: "multi-type" | "single-type";
	connectionType?: string;
	connectionTypeLabel?: string;
	integration: Integrations;
	integrationLabel: string;
	testName: string;
}

export function discoverAllIntegrations(): DiscoveredTestCase[] {
	const testCases: DiscoveredTestCase[] = [];

	for (const integrationKey of Object.values(Integrations)) {
		const integration = integrationKey as Integrations;

		if (shouldHideIntegration[integration]) {
			continue;
		}

		const integrationData = IntegrationsMap[integration];

		if (!integrationData) {
			continue;
		}

		const integrationLabel = integrationData.label;
		const connectionAuthTypes = allConnectionsAuthTypes[integration];

		if (connectionAuthTypes && connectionAuthTypes.length > 0) {
			for (const authType of connectionAuthTypes) {
				const connectionAuthTypeLabel = authType.label;
				testCases.push({
					category: "multi-type",
					connectionType: authType.value,
					connectionTypeLabel: connectionAuthTypeLabel,
					integration,
					integrationLabel,
					testName: `${integrationLabel} - ${connectionAuthTypeLabel}`,
				});
			}
		} else {
			testCases.push({
				category: "single-type",
				integration,
				integrationLabel,
				testName: integrationLabel,
			});
		}
	}

	return testCases;
}

export function getIntegrationStats() {
	const testCases = discoverAllIntegrations();
	const singleType = testCases.filter((tc) => tc.category === "single-type");
	const multiType = testCases.filter((tc) => tc.category === "multi-type");

	return {
		integrations: testCases.length,
		multiType: multiType.length,
		singleType: singleType.length,
		total: testCases.length,
	};
}
