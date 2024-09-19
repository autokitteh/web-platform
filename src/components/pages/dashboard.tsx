import React, { useMemo } from "react";

import { useResize } from "@src/hooks";
import { useProjectStore } from "@src/store";

import { Frame, Loader } from "@components/atoms";
import { DashboardProjectsTable, DashboardTopbar, DashboardWelcomeMainBlock } from "@components/organisms";
import { ProjectTemplatesSection } from "@components/organisms/dashboard/templates";

import { CatDashboardImage } from "@assets/image";

export const Dashboard = () => {
	const { isLoadingProjectsList, projectsList } = useProjectStore();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 70, max: 78, min: 30 });

	const hasProjects = !!projectsList.length;

	const dashboardContent = useMemo(() => {
		if (isLoadingProjectsList) {
			return <Loader isCenter size="lg" />;
		} else if (!hasProjects) {
			return <DashboardWelcomeMainBlock />;
		} else {
			return <DashboardProjectsTable />;
		}
	}, [isLoadingProjectsList, hasProjects]);

	return (
		<div className="m-4 ml-0 flex w-full overflow-hidden rounded-2xl">
			<div className="relative flex w-2/3 flex-col" style={{ width: `${leftSideWidth}%` }}>
				<Frame className="flex-1 rounded-r-none bg-gray-1100">
					<DashboardTopbar />

					{dashboardContent}
				</Frame>

				{!hasProjects && !isLoadingProjectsList ? (
					<CatDashboardImage className="absolute -bottom-6 -right-5 hidden minHeightLg:block" />
				) : null}
			</div>

			{/* eslint-disable-next-line tailwindcss/no-custom-classname, @liferay/empty-line-between-elements */}
			<div className="resize-handle-horizontal z-10 -ml-2 w-1 cursor-ew-resize transition hover:bg-gray-750" />

			<div style={{ width: `${100 - (leftSideWidth as number)}%` }}>
				<ProjectTemplatesSection />
			</div>
		</div>
	);
};
