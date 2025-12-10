import { DashboardSummaryData, formatNumber } from "@utilities/fakeDashboardData";

import { MetricGroup, StatCard } from "@components/molecules/charts";

interface HeroStatsProps {
	summary: DashboardSummaryData;
	totalSessions: number;
	isLoading?: boolean;
}

export const HeroStats = ({ summary, totalSessions, isLoading = false }: HeroStatsProps) => (
	<MetricGroup columns={4}>
		<StatCard
			delta={summary.totalProjectsChange}
			deltaLabel="vs last period"
			isLoading={isLoading}
			title="Total Projects"
			value={summary.totalProjects}
		/>
		<StatCard
			delta={summary.activeSessionsChange}
			deltaLabel="%"
			isLoading={isLoading}
			title="Active Sessions"
			value={totalSessions}
		/>
		<StatCard
			delta={summary.successRateChange}
			deltaLabel="%"
			isLoading={isLoading}
			title="Success Rate"
			value={`${summary.successRate}%`}
		/>
		<StatCard
			delta={summary.eventsProcessedChange}
			deltaLabel="vs last period"
			isLoading={isLoading}
			title="Events Processed"
			value={formatNumber(summary.eventsProcessed)}
		/>
	</MetricGroup>
);
