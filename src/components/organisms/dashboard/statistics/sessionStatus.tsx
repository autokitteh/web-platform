import { SessionStatusData } from "@utilities/fakeDashboardData";

import { ChartContainer, SessionStatusDonutChart } from "@components/molecules/charts";

interface SessionStatusProps {
	data: SessionStatusData[];
	isLoading?: boolean;
}

export const SessionStatus = ({ data, isLoading = false }: SessionStatusProps) => (
	<ChartContainer isLoading={isLoading} subtitle="Distribution of session outcomes" title="Session Status">
		<SessionStatusDonutChart data={data} />
	</ChartContainer>
);
