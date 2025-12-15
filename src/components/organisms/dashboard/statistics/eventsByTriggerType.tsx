import { EventsByTriggerData } from "@utilities/fakeDashboardData";

import { ChartContainer, EventsByTriggerChart } from "@components/molecules/charts";

interface EventsByTriggerTypeProps {
	data: EventsByTriggerData[];
	isLoading?: boolean;
}

export const EventsByTriggerType = ({ data, isLoading = false }: EventsByTriggerTypeProps) => (
	<ChartContainer isLoading={isLoading} subtitle="How events are triggered" title="Events by Trigger Type">
		<EventsByTriggerChart className="h-64" data={data} />
	</ChartContainer>
);
