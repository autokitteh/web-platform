import React, { useId } from "react";

import { useResize, useWindowDimensions } from "@src/hooks";

import { Frame, ResizeButton } from "@components/atoms";
import { DashboardTopbar, IntroMainBlock } from "@components/organisms";
import { ProjectTemplatesSection } from "@components/organisms/dashboard/templates";

export const Intro = () => {
	const resizeId = useId();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 70, max: 70, min: 30, id: resizeId });
	const { isMaxWidth768 } = useWindowDimensions();

	return (
		<div className="my-0 flex w-full overflow-hidden rounded-none md:my-1.5 md:rounded-2xl">
			<div className="relative flex w-2/3 flex-col" style={{ width: `${!isMaxWidth768 ? leftSideWidth : 100}%` }}>
				<Frame className="flex-1 rounded-none bg-gray-1100 md:rounded-r-none">
					<DashboardTopbar />

					<IntroMainBlock />
				</Frame>
			</div>
			{!isMaxWidth768 ? (
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
			) : null}
		</div>
	);
};
