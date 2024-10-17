import React, { useId } from "react";

import { useResize } from "@src/hooks";

import { Frame, ResizeButton } from "@components/atoms";
import { DashboardTopbar, IntroMainBlock } from "@components/organisms";
import { ProjectTemplatesSection } from "@components/organisms/dashboard/templates";

import { CatDashboardImage } from "@assets/image";

export const Intro = () => {
	const resizeId = useId();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 70, max: 78, min: 30, id: resizeId });

	return (
		<div className="my-1.5 flex w-full overflow-hidden rounded-2xl">
			<div className="relative flex w-2/3 flex-col" style={{ width: `${leftSideWidth}%` }}>
				<Frame className="flex-1 rounded-r-none bg-gray-1100">
					<DashboardTopbar />

					<IntroMainBlock />
				</Frame>

				<CatDashboardImage className="absolute -bottom-6 -right-5 hidden minHeightLg:block" />
			</div>

			<ResizeButton className="right-0.5 bg-white hover:bg-gray-700" direction="horizontal" resizeId={resizeId} />

			<div style={{ width: `${100 - (leftSideWidth as number)}%` }}>
				<ProjectTemplatesSection />
			</div>
		</div>
	);
};
