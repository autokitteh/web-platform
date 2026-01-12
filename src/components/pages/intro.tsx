import React, { useEffect, useId } from "react";

import { ModalName } from "@src/enums/components";
import { useResize, useWindowDimensions } from "@src/hooks";
import { useModalStore } from "@src/store";

import { Frame, ResizeButton } from "@components/atoms";
import { DashboardTopbar, IntroMainBlock } from "@components/organisms";
import { TemplatesCatalog } from "@components/organisms/dashboard/templates";

export const Intro = () => {
	const resizeId = useId();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 70, max: 70, min: 30, id: resizeId });
	const { isIOS, isMobile } = useWindowDimensions();
	const { openModal } = useModalStore();

	useEffect(() => {
		openModal(ModalName.toursProgress);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex size-full overflow-hidden rounded-none md:mt-1.5 md:rounded-2xl">
			<div
				className="relative flex w-2/3 flex-col"
				style={{ width: `${!(isIOS || isMobile) ? leftSideWidth : 100}%` }}
			>
				<Frame className="flex-1 rounded-none bg-gray-1100 md:rounded-r-none">
					<DashboardTopbar />
					<IntroMainBlock />
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
						<TemplatesCatalog />
					</div>
				</>
			)}
		</div>
	);
};
