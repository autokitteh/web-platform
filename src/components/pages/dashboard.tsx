import React, { useId, useMemo } from "react";

import { useResize } from "@src/hooks";
import { useProjectStore } from "@src/store";

import { Frame, Loader, ResizeButton } from "@components/atoms";
import { DashboardProjectsTable, DashboardTopbar, IntroMainBlock } from "@components/organisms";
import { ProjectTemplatesSection } from "@components/organisms/dashboard/templates";

export const Dashboard = () => {
	const resizeId = useId();
	const { isLoadingProjectsList, projectsList } = useProjectStore();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 70, max: 78, min: 30, id: resizeId });

	const hasProjects = projectsList.length;

	const dashboardContent = useMemo(() => {
		if (isLoadingProjectsList) {
			return <Loader isCenter size="lg" />;
		} else if (!hasProjects) {
			return <IntroMainBlock />;
		} else {
			return <DashboardProjectsTable />;
		}
	}, [isLoadingProjectsList, hasProjects]);

	return (
		<div className="my-1.5 flex w-full overflow-hidden rounded-2xl">
			<div className="relative flex w-2/3 flex-col" style={{ width: `${leftSideWidth}%` }}>
				<Frame className="h-full flex-1 rounded-r-none bg-gray-1100">
					<DashboardTopbar />

					{dashboardContent}
				</Frame>
			</div>
			<ResizeButton className="right-0.5 bg-white hover:bg-gray-700" direction="horizontal" resizeId={resizeId} />

			<div style={{ width: `${100 - (leftSideWidth as number)}%` }}>
				<ProjectTemplatesSection />
			</div>
		</div>
	);
};
