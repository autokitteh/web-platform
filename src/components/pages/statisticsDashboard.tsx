import React, { useCallback, useEffect, useId, useMemo, useState } from "react";

import { cn } from "@utilities";
import {
	DashboardSummaryData,
	EventsByTriggerData,
	formatDuration,
	formatNumber,
	generateDashboardSummary,
	generateEventsByTriggerData,
	generateIntegrationUsageData,
	generateRecentSessionsData,
	generateSessionStatusData,
	IntegrationUsageData,
	RecentSessionData,
	SessionStatusData,
} from "@utilities/fakeDashboardData";

import { useDashboardAutoRefresh, useResize, useWindowDimensions } from "@hooks";
import { useProjectStore, useSharedBetweenProjectsStore } from "@store";

import { Frame, IconSvg, Loader, ResizeButton, Typography } from "@components/atoms";
import { ChartContainer, EventsByTriggerChart, IntegrationUsageChart } from "@components/molecules/charts";
import {
	ActivityPulse,
	DashboardHeader,
	HeroMetricCard,
	QuickActions,
	SessionsRing,
} from "@components/organisms/dashboard/statistics";
import { TemplatesCatalog } from "@components/organisms/dashboard/templates/catalog";

import { RocketIcon, SessionsIcon, CheckCircleIcon, WebhookIcon } from "@assets/image/icons";

const ActivityItem = ({ session }: { session: RecentSessionData }) => ({
	id: session.sessionId,
	projectName: session.projectName,
	status: session.status,
	timestamp: session.lastActivityTime,
	duration: formatDuration(session.durationMs),
});

export const StatisticsDashboard = () => {
	const resizeId = useId();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 70, max: 70, min: 30, id: resizeId });
	const { isMobile } = useWindowDimensions();
	const { projectsList, isLoadingProjectsList } = useProjectStore();
	const { fullScreenDashboard } = useSharedBetweenProjectsStore();

	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<string>("");

	const [summary, setSummary] = useState<DashboardSummaryData>(generateDashboardSummary());
	const [sessionStatus, setSessionStatus] = useState<SessionStatusData[]>(generateSessionStatusData());
	const [eventsByTrigger, setEventsByTrigger] = useState<EventsByTriggerData[]>(generateEventsByTriggerData());
	const [integrationUsage, setIntegrationUsage] = useState<IntegrationUsageData[]>(generateIntegrationUsageData());
	const [recentSessions, setRecentSessions] = useState<RecentSessionData[]>(generateRecentSessionsData());

	const refreshData = useCallback(() => {
		setIsRefreshing(true);
		setTimeout(() => {
			setSummary(generateDashboardSummary());
			setSessionStatus(generateSessionStatusData());
			setEventsByTrigger(generateEventsByTriggerData());
			setIntegrationUsage(generateIntegrationUsageData());
			setRecentSessions(generateRecentSessionsData());
			setLastUpdated(new Date().toLocaleTimeString());
			setIsRefreshing(false);
		}, 300);
	}, []);

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

	const activityItems = useMemo(
		() => recentSessions.slice(0, 8).map((session) => ActivityItem({ session })),
		[recentSessions]
	);

	const showSidebar = !isMobile && !fullScreenDashboard;

	return (
		<div className="my-1.5 flex size-full overflow-hidden rounded-none md:rounded-2xl">
			<div
				className="relative flex flex-col"
				style={{ width: `${isMobile || fullScreenDashboard ? 100 : leftSideWidth}%` }}
			>
				<Frame className="flex-1 rounded-none bg-gray-1100 md:rounded-r-none md:pb-0">
					{isLoadingProjectsList ? (
						<Loader isCenter size="lg" />
					) : (
						<>
							<DashboardHeader
								isRefreshing={isRefreshing}
								lastUpdated={lastUpdated}
								onRefresh={handleManualRefresh}
								title="Dashboard"
							/>

							<div className="mt-6 flex flex-col gap-8">
								<section aria-label="Quick actions" className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<Typography
											className="font-averta text-sm font-medium text-gray-500"
											element="span"
										>
											{projectsList.length} projects
										</Typography>
									</div>
									<QuickActions />
								</section>

								<section aria-label="Key metrics">
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
										<HeroMetricCard
											delta={summary.totalProjectsChange}
											deltaLabel=" this week"
											icon={<IconSvg className="size-5 fill-white" src={RocketIcon} />}
											isLoading={isLoading}
											subtitle="Active automations"
											title="Total Projects"
											value={summary.totalProjects}
											variant="primary"
										/>
										<HeroMetricCard
											delta={summary.activeSessionsChange}
											deltaLabel="%"
											icon={<IconSvg className="size-5 fill-emerald-400" src={SessionsIcon} />}
											isLoading={isLoading}
											subtitle="Currently running"
											title="Active Sessions"
											value={totalSessions}
											variant="success"
										/>
										<HeroMetricCard
											delta={summary.successRateChange}
											deltaLabel="%"
											icon={<IconSvg className="size-5 fill-blue-400" src={CheckCircleIcon} />}
											isLoading={isLoading}
											subtitle="Completion rate"
											title="Success Rate"
											value={`${summary.successRate}%`}
											variant="info"
										/>
										<HeroMetricCard
											delta={summary.eventsProcessedChange}
											deltaLabel=" events"
											icon={<IconSvg className="size-5 fill-amber-400" src={WebhookIcon} />}
											isLoading={isLoading}
											subtitle="Last 24 hours"
											title="Events Processed"
											value={formatNumber(summary.eventsProcessed)}
											variant="warning"
										/>
									</div>
								</section>

								<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
									<section aria-label="Activity feed" className="xl:col-span-1">
										<ActivityPulse activities={activityItems} isLoading={isLoading} />
									</section>

									<section aria-label="Session overview" className="xl:col-span-2">
										<SessionsRing data={sessionStatus} isLoading={isLoading} />
									</section>
								</div>

								<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
									<section aria-label="Events by trigger">
										<ChartContainer
											className="p-6"
											isLoading={isLoading}
											subtitle="Distribution of automation triggers"
											title="Events by Trigger Type"
										>
											<EventsByTriggerChart className="h-64" data={eventsByTrigger} />
										</ChartContainer>
									</section>

									<section aria-label="Top integrations">
										<ChartContainer
											className="p-6"
											isLoading={isLoading}
											subtitle="Most active platform connections"
											title="Top Integrations"
										>
											<IntegrationUsageChart className="h-64" data={integrationUsage} />
										</ChartContainer>
									</section>
								</div>
							</div>
						</>
					)}
				</Frame>
			</div>

			{showSidebar ? (
				<>
					<ResizeButton
						className="right-0.5 bg-white hover:bg-gray-700"
						direction="horizontal"
						resizeId={resizeId}
					/>

					<div
						className={cn("transition-all duration-300")}
						style={{ width: `${100 - (leftSideWidth as number)}%` }}
					>
						<TemplatesCatalog />
					</div>
				</>
			) : null}
		</div>
	);
};
