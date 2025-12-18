import { IntegrationUsageData } from "@interfaces/components";

import { ChartContainer, IntegrationUsageChart } from "@components/molecules/charts";

interface TopIntegrationsProps {
	data: IntegrationUsageData[];
	isLoading?: boolean;
}

export const TopIntegrations = ({ data, isLoading = false }: TopIntegrationsProps) => (
	<ChartContainer isLoading={isLoading} subtitle="Most used integrations" title="Top Integrations">
		<IntegrationUsageChart className="h-64" data={data} />
	</ChartContainer>
);
