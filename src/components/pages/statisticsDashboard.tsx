import React, { useCallback, useEffect, useId, useMemo, useState } from "react";

import { useSharedBetweenProjectsStore } from "@src/store";
import {
	formatNumber,
	generateDashboardSummary,
	generateErrorSessionsData,
	generateSessionStatusData,
	generateSessionsOverTimeData,
} from "@utilities/fakeDashboardData";

import { useDashboardAutoRefresh, useResize, useWindowDimensions } from "@hooks";

import { Frame, ResizeButton } from "@components/atoms";
import {
	ChartContainer,
	ErrorSessionsTable,
	MetricGroup,
	SessionsOverTimeChart,
	SessionStatusDonutChart,
	StatCard,
} from "@components/molecules/charts";
import { DashboardProjectsTable } from "@components/organisms";
import { DashboardHeader, StatisticsHomeLayout } from "@components/organisms/dashboard/statistics";
import { TemplatesCatalog } from "@components/organisms/dashboard/templates";

export const StatisticsDashboard = () => {
	const resizeId = useId();
	const [leftSideWidth] = useResize({ direction: "horizontal", id: resizeId, initial: 70, max: 70, min: 30 });
	const { isMobile } = useWindowDimensions();
	const { fullScreenDashboard } = useSharedBetweenProjectsStore();

	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<string>("");

	const [summary, setSummary] = useState(generateDashboardSummary());
	const [sessionStatus, setSessionStatus] = useState(generateSessionStatusData());
	const [sessionsOverTime, setSessionsOverTime] = useState(generateSessionsOverTimeData());
	const [errorSessions, setErrorSessions] = useState(generateErrorSessionsData());

	const refreshData = useCallback(() => {
		setIsRefreshing(true);
		setSummary(generateDashboardSummary());
		setSessionStatus(generateSessionStatusData());
		setSessionsOverTime(generateSessionsOverTimeData());
		setErrorSessions(generateErrorSessionsData());
		setLastUpdated(new Date().toLocaleTimeString());
		setIsRefreshing(false);
	}, []);

	const { triggerManualRefresh } = useDashboardAutoRefresh({
		enabled: true,
		onRefresh: refreshData,
	});

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
			setLastUpdated(new Date().toLocaleTimeString());
		}, 800);

		return () => clearTimeout(timer);
	}, []);

	const handleManualRefresh = useCallback(() => {
		triggerManualRefresh();
	}, [triggerManualRefresh]);

	const totalSessions = useMemo(() => sessionStatus.reduce((sum, item) => sum + item.count, 0), [sessionStatus]);

	const projectsTable = <DashboardProjectsTable />;

	const sessionStatusChart = (
		<ChartContainer isLoading={isLoading} title="Session Status">
			<SessionStatusDonutChart className="h-64" data={sessionStatus} />
		</ChartContainer>
	);

	const errorSessionsTableChart = (
		<ChartContainer isLoading={isLoading} title="Recent Error Sessions">
			<ErrorSessionsTable className="max-h-72 overflow-auto" data={errorSessions} />
		</ChartContainer>
	);

	const sessionsOverTimeChart = (
		<ChartContainer isLoading={isLoading} title="Sessions Over Time">
			<SessionsOverTimeChart className="h-64" data={sessionsOverTime} />
		</ChartContainer>
	);

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

	return (
		<div className="my-1.5 flex size-full overflow-hidden rounded-none md:rounded-2xl">
			<div
				className="relative flex w-2/3 flex-col"
				style={{ width: `${isMobile || fullScreenDashboard ? 100 : leftSideWidth}%` }}
			>
				<Frame className="flex-1 rounded-none bg-gray-1100 md:rounded-r-none md:pb-0">
					<DashboardHeader
						isRefreshing={isRefreshing}
						lastUpdated={lastUpdated}
						onRefresh={handleManualRefresh}
						title="Dashboard"
					/>
					<StatisticsHomeLayout
						errorSessionsTable={errorSessionsTableChart}
						heroStats={heroStats}
						projectsTable={projectsTable}
						sessionStatusChart={sessionStatusChart}
						sessionsOverTimeChart={sessionsOverTimeChart}
					/>
				</Frame>
			</div>
			{isMobile || fullScreenDashboard ? null : (
				<>
					<ResizeButton
						className="right-0.5 bg-white hover:bg-gray-700"
						direction="horizontal"
						resizeId={resizeId}
					/>
					<div style={{ width: `${100 - (leftSideWidth as number)}%` }}>
						<TemplatesCatalog />
					</div>
				</>
			)}
		</div>
	);
};
