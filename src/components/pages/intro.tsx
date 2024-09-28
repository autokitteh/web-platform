import React from "react";

import { useResize } from "@src/hooks";

import { Frame } from "@components/atoms";
import { DashboardTopbar, IntroMainBlock } from "@components/organisms";
import { ProjectTemplatesSection } from "@components/organisms/dashboard/templates";

import { CatDashboardImage } from "@assets/image";

export const Intro = () => {
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 70, max: 78, min: 30 });

	return (
		<div className="m-4 ml-0 flex w-full overflow-hidden rounded-2xl">
			<div className="relative flex w-2/3 flex-col" style={{ width: `${leftSideWidth}%` }}>
				<Frame className="flex-1 rounded-r-none bg-gray-1100">
					<DashboardTopbar />

					<IntroMainBlock />
				</Frame>

				<CatDashboardImage className="absolute -bottom-6 -right-5 hidden minHeightLg:block" />
			</div>

			{/* eslint-disable-next-line tailwindcss/no-custom-classname */}
			<div className="resize-handle-horizontal z-10 -ml-2 w-1 cursor-ew-resize transition hover:bg-gray-750" />

			<div style={{ width: `${100 - (leftSideWidth as number)}%` }}>
				<ProjectTemplatesSection />
			</div>
		</div>
	);
};
