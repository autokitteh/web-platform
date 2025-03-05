import React, { useEffect, useId, useMemo } from "react";

import { useResize, useWindowDimensions } from "@src/hooks";
import { useProjectStore } from "@src/store";

import { Frame, Loader, ResizeButton } from "@components/atoms";
import { DashboardProjectsTable, DashboardTopbar, IntroMainBlock, WelcomePage } from "@components/organisms";
import { ProjectTemplatesSection } from "@components/organisms/dashboard/templates";
import { Socials } from "@components/organisms/shared";

export const Dashboard = () => {
	const resizeId = useId();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 70, max: 70, min: 30, id: resizeId });
	const { isMobile } = useWindowDimensions();
	const { getProjectsList, isLoadingProjectsList, projectsList } = useProjectStore();

	useEffect(() => {
		if (!projectsList.length && isMobile) {
			getProjectsList();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const dashboardContent = useMemo(() => {
		if (isLoadingProjectsList) {
			return <Loader isCenter size="lg" />;
		} else if (!projectsList.length) {
			return <IntroMainBlock />;
		} else {
			return (
				<>
					<DashboardProjectsTable />
					<Socials iconsClass="size-6" wrapperClass="border-t-0.5 border-gray-1050 pt-4" />
				</>
			);
		}
	}, [isLoadingProjectsList, projectsList]);

	return !isLoadingProjectsList && !projectsList.length ? (
		<div className="size-full overflow-hidden rounded-none md:mt-1.5 md:rounded-2xl">
			<WelcomePage />
		</div>
	) : (
		<div className="flex size-full overflow-hidden rounded-none md:mt-1.5 md:rounded-2xl">
			<div className="relative flex w-2/3 flex-col" style={{ width: `${!isMobile ? leftSideWidth : 100}%` }}>
				<Frame className="flex-1 rounded-none bg-gray-1100 md:rounded-r-none md:pb-0">
					<DashboardTopbar />

					{dashboardContent}
				</Frame>
			</div>
			{isMobile ? null : (
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
