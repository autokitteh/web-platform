import React, { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardTimeRange, defaultTimeRange } from "@constants";
import {
	formatNumber,
	generateDashboardSummary,
	generateEventsByTriggerData,
	generateIntegrationUsageData,
	generateRecentSessionsData,
	generateSessionsOverTimeData,
	generateSessionStatusData,
} from "@utilities/fakeDashboardData";

import { useDashboardAutoRefresh } from "@hooks";

import { Frame } from "@components/atoms";
import { Button } from "@components/atoms/buttons";
import {
	ChartContainer,
	EventsByTriggerChart,
	IntegrationUsageChart,
	MetricGroup,
	RecentSessionsTable,
	SessionStatusDonutChart,
	SessionsOverTimeChart,
	StatCard,
} from "@components/molecules/charts";
import { DashboardHeader } from "@components/organisms/dashboard/statistics/dashboardHeader";
import { HomeDashboardLayout } from "@components/organisms/dashboard/statistics/homeDashboardLayout";

export const StatisticsDashboard = () => {
	const [timeRange, setTimeRange] = useState<DashboardTimeRange>(defaultTimeRange);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<string>("");

	const [summary, setSummary] = useState(generateDashboardSummary());
	const [sessionStatus, setSessionStatus] = useState(generateSessionStatusData());
	const [sessionsOverTime, setSessionsOverTime] = useState(generateSessionsOverTimeData(timeRange));
	const [eventsByTrigger, setEventsByTrigger] = useState(generateEventsByTriggerData());
	const [integrationUsage, setIntegrationUsage] = useState(generateIntegrationUsageData());
	const [recentSessions, setRecentSessions] = useState(generateRecentSessionsData());

	const refreshData = useCallback(() => {
		setIsRefreshing(true);
		setTimeout(() => {
			setSummary(generateDashboardSummary());
			setSessionStatus(generateSessionStatusData());
			setSessionsOverTime(generateSessionsOverTimeData(timeRange));
			setEventsByTrigger(generateEventsByTriggerData());
			setIntegrationUsage(generateIntegrationUsageData());
			setRecentSessions(generateRecentSessionsData());
			setLastUpdated(new Date().toLocaleTimeString());
			setIsRefreshing(false);
		}, 500);
	}, [timeRange]);

	const { triggerManualRefresh } = useDashboardAutoRefresh({
		onRefresh: refreshData,
		enabled: true,
	});

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
			setLastUpdated(new Date().toLocaleTimeString());
		}, 800);

		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (!isLoading) {
			setSessionsOverTime(generateSessionsOverTimeData(timeRange));
		}
	}, [timeRange, isLoading]);

	const handleTimeRangeChange = useCallback((newRange: DashboardTimeRange) => {
		setTimeRange(newRange);
	}, []);

	const handleManualRefresh = useCallback(() => {
		triggerManualRefresh();
	}, [triggerManualRefresh]);

	const totalSessions = useMemo(() => sessionStatus.reduce((sum, item) => sum + item.count, 0), [sessionStatus]);

	const heroStats = (
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

	const mainCharts = (
		<>
			<ChartContainer isLoading={isLoading} subtitle="Distribution of session outcomes" title="Session Status">
				<SessionStatusDonutChart className="h-72" data={sessionStatus} />
			</ChartContainer>
			<ChartContainer
				isLoading={isLoading}
				subtitle={`Session activity over ${timeRange}`}
				title="Sessions Over Time"
			>
				<SessionsOverTimeChart className="h-72" data={sessionsOverTime} />
			</ChartContainer>
		</>
	);

	const secondaryCharts = (
		<>
			<ChartContainer isLoading={isLoading} subtitle="How events are triggered" title="Events by Trigger Type">
				<EventsByTriggerChart className="h-64" data={eventsByTrigger} />
			</ChartContainer>
			<ChartContainer isLoading={isLoading} subtitle="Most used integrations" title="Top Integrations">
				<IntegrationUsageChart className="h-64" data={integrationUsage} />
			</ChartContainer>
		</>
	);

	const recentActivity = (
		<div className="flex flex-col gap-6">
			<RecentSessionsTable data={recentSessions} isLoading={isLoading} />
			<div className="rounded-xl border border-gray-1050 bg-gray-1200 p-6">
				<h3 className="text-lg font-semibold text-white">Quick Actions</h3>
				<div className="mt-4 flex flex-wrap gap-3">
					<Button
						className="rounded-full border border-green-400/50 bg-transparent px-6 py-2 text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10"
						href="/"
					>
						View All Projects
					</Button>
					<Button
						className="rounded-full border border-green-400/50 bg-transparent px-6 py-2 text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10"
						href="/connections"
					>
						Manage Connections
					</Button>
					<Button
						className="rounded-full border border-green-400/50 bg-transparent px-6 py-2 text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10"
						href="/templates-library"
					>
						Browse Templates
					</Button>
					<Button
						className="rounded-full border border-green-400/50 bg-transparent px-6 py-2 text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10"
						href="/events"
					>
						View All Events
					</Button>
				</div>
			</div>
		</div>
	);

	return (
		<div className="my-1.5 flex size-full overflow-hidden rounded-none md:rounded-2xl">
			<Frame className="flex-1 rounded-none bg-gray-1100 md:rounded-r-none">
				<DashboardHeader
					isRefreshing={isRefreshing}
					lastUpdated={lastUpdated}
					onRefresh={handleManualRefresh}
					onTimeRangeChange={handleTimeRangeChange}
					subtitle="Overview of your automation workflows and sessions"
					timeRange={timeRange}
					title="Statistics"
				/>
				<HomeDashboardLayout
					heroStats={heroStats}
					mainCharts={mainCharts}
					recentActivity={recentActivity}
					secondaryCharts={secondaryCharts}
				/>
			</Frame>
		</div>
	);
};
