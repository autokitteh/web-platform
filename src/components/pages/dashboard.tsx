import React, { useId, useMemo } from "react";

import { useResize, useWindowDimensions } from "@src/hooks";
import { useProjectStore } from "@src/store";

import { Frame, Loader, ResizeButton } from "@components/atoms";
import { DashboardProjectsTable, DashboardTopbar, IntroMainBlock } from "@components/organisms";
import { ProjectTemplatesSection } from "@components/organisms/dashboard/templates";

export const Dashboard = () => {
	const resizeId = useId();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 70, max: 70, min: 30, id: resizeId });
	const { isIOS, isMobile } = useWindowDimensions();
	const { isLoadingProjectsList, projectsList } = useProjectStore();

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
		<div className="my-0 flex w-full overflow-hidden rounded-none md:my-1.5 md:rounded-2xl">
			<div
				className="relative flex w-2/3 flex-col"
				style={{ width: `${!(isIOS || isMobile) ? leftSideWidth : 100}%` }}
			>
				<Frame className="flex-1 rounded-none bg-gray-1100 md:rounded-r-none">
					<DashboardTopbar />

					{dashboardContent}
				</Frame>
			</div>
			{isIOS || isMobile ? null : (
				<>
					<ResizeButton
						className="right-0.5 bg-white hover:bg-gray-700"
						direction="horizontal"
						resizeId={resizeId}
					/>

					<div style={{ width: `${100 - (leftSideWidth as number)}%` }}>
						<ProjectTemplatesSection />
					</div>
				</>
			)}
		</div>
	);
};
