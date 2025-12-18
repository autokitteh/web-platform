import React, { useCallback, useId, useMemo } from "react";

import { TotalCountersData } from "@interfaces/components";
import { useDashboardStatisticsStore, useSharedBetweenProjectsStore } from "@src/store";

import { useDashboardAutoRefresh, useResize, useWindowDimensions } from "@hooks";

import { Frame, ResizeButton } from "@components/atoms";
import { ActiveDeploymentsTable, SessionStatusDonutChart, TotalCountersGrid } from "@components/molecules/charts";
import { DashboardProjectsTable } from "@components/organisms";
import { DashboardHeader, StatisticsHomeLayout } from "@components/organisms/dashboard/statistics";
import { TemplatesCatalog } from "@components/organisms/dashboard/templates";

export const StatisticsDashboard = () => {
	const resizeId = useId();
	const [leftSideWidth] = useResize({ direction: "horizontal", id: resizeId, initial: 70, max: 70, min: 30 });
	const { isMobile } = useWindowDimensions();
	const { fullScreenDashboard } = useSharedBetweenProjectsStore();

	const { statistics, activeDeploymentsList, sessionStatusData, isLoading } = useDashboardStatisticsStore();

	const totalCountersData: TotalCountersData = useMemo(
		() => ({
			totalProjects: statistics.totalProjects,
			activeProjects: statistics.activeProjects,
			totalDeployments: statistics.totalDeployments,
			activeDeployments: statistics.activeDeployments,
			sessionsByStatus: statistics.sessionsByStatus,
		}),
		[statistics]
	);

	const { triggerManualRefresh } = useDashboardAutoRefresh({
		enabled: true,
		onRefresh: () => {},
	});

	const handleManualRefresh = useCallback(() => {
		triggerManualRefresh();
	}, [triggerManualRefresh]);

	const projectsTable = <DashboardProjectsTable />;

	const totalCountersGrid = <TotalCountersGrid data={totalCountersData} isLoading={isLoading} />;

	const deploymentStatsTable = <ActiveDeploymentsTable data={activeDeploymentsList} isLoading={isLoading} />;

	const sessionStatusChart = <SessionStatusDonutChart className="h-full" data={sessionStatusData} />;

	return (
		<div className="my-1.5 flex size-full overflow-hidden rounded-none md:rounded-2xl">
			<div
				className="relative flex w-2/3 flex-col"
				style={{ width: `${isMobile || fullScreenDashboard ? 100 : leftSideWidth}%` }}
			>
				<Frame className="flex-1 rounded-none bg-gray-1100 md:rounded-r-none md:pb-0">
					<DashboardHeader onRefresh={handleManualRefresh} title="Dashboard" />
					<StatisticsHomeLayout
						deploymentStats={deploymentStatsTable}
						projectsTable={projectsTable}
						sessionStatusChart={sessionStatusChart}
						totalCounters={totalCountersGrid}
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
