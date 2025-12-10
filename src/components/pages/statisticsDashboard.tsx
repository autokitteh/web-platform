import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
	generateDashboardSummary,
	generateEventsByTriggerData,
	generateIntegrationUsageData,
	generateRecentSessionsData,
	generateSessionStatusData,
} from "@utilities/fakeDashboardData";

import { useDashboardAutoRefresh } from "@hooks";

import { Frame } from "@components/atoms";
import { ProjectsTable } from "@components/molecules/charts";
import { DashboardHeader } from "@components/organisms/dashboard/statistics/dashboardHeader";
import { EventsByTriggerType } from "@components/organisms/dashboard/statistics/eventsByTriggerType";
import { HeroStats } from "@components/organisms/dashboard/statistics/heroStats";
import { HomeDashboardLayout } from "@components/organisms/dashboard/statistics/homeDashboardLayout";
import { SessionStatus } from "@components/organisms/dashboard/statistics/sessionStatus";
import { TopIntegrations } from "@components/organisms/dashboard/statistics/topIntegrations";

export const StatisticsDashboard = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<string>("");

	const [summary, setSummary] = useState(generateDashboardSummary());
	const [sessionStatus, setSessionStatus] = useState(generateSessionStatusData());
	const [eventsByTrigger, setEventsByTrigger] = useState(generateEventsByTriggerData());
	const [integrationUsage, setIntegrationUsage] = useState(generateIntegrationUsageData());
	const [recentSessions, setRecentSessions] = useState(generateRecentSessionsData());

	const refreshData = () => {
		setIsRefreshing(true);
		setSummary(generateDashboardSummary());
		setSessionStatus(generateSessionStatusData());
		setEventsByTrigger(generateEventsByTriggerData());
		setIntegrationUsage(generateIntegrationUsageData());
		setRecentSessions(generateRecentSessionsData());
		setLastUpdated(new Date().toLocaleTimeString());
		setIsRefreshing(false);
	};

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

	const handleManualRefresh = useCallback(() => {
		triggerManualRefresh();
	}, [triggerManualRefresh]);

	const totalSessions = useMemo(() => sessionStatus.reduce((sum, item) => sum + item.count, 0), [sessionStatus]);

	const heroStats = <HeroStats isLoading={isLoading} summary={summary} totalSessions={totalSessions} />;

	const mainCharts = <SessionStatus data={sessionStatus} isLoading={isLoading} />;

	const eventsByTriggerType = <EventsByTriggerType data={eventsByTrigger} isLoading={isLoading} />;

	const topIntegrations = <TopIntegrations data={integrationUsage} isLoading={isLoading} />;

	const recentActivity = (
		<div className="flex flex-col gap-6">
			<ProjectsTable data={recentSessions} isLoading={isLoading} />
		</div>
	);

	return (
		<div className="my-1.5 flex size-full overflow-hidden rounded-none md:rounded-2xl">
			<Frame className="flex-1 rounded-none bg-gray-1100 md:rounded-r-none">
				<DashboardHeader
					isRefreshing={isRefreshing}
					lastUpdated={lastUpdated}
					onRefresh={handleManualRefresh}
					title="Projects"
				/>
				<HomeDashboardLayout
					eventsByTrigger={eventsByTriggerType}
					heroStats={heroStats}
					mainCharts={mainCharts}
					recentActivity={recentActivity}
					topIntegrations={topIntegrations}
				/>
			</Frame>
		</div>
	);
};
