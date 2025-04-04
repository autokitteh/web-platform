import React, { useEffect, useId, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { tours } from "@src/constants/tour.constants";
import { ModalName } from "@src/enums/components";
import { useResize, useWindowDimensions } from "@src/hooks";
import { useToastStore } from "@src/store";
import { useModalStore } from "@store/useModalStore";
import { useTourStore } from "@store/useTourStore";

import { Frame, ResizeButton } from "@components/atoms";
import { ToursProgress } from "@components/molecules/toursProgress";
import { DashboardTopbar, IntroMainBlock } from "@components/organisms";
import { TemplatesCatalog } from "@components/organisms/dashboard/templates";

export const Intro = () => {
	const resizeId = useId();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 70, max: 70, min: 30, id: resizeId });
	const { isIOS, isMobile } = useWindowDimensions();
	const { completedTours, startTour } = useTourStore();
	const { openModal } = useModalStore();
	const { addToast } = useToastStore();
	const { t: tTours } = useTranslation("dashboard", { keyPrefix: "tours" });
	const navigate = useNavigate();
	const [isStarting, setIsStarting] = useState(false);

	useEffect(() => {
		if (Object.keys(tours).length !== completedTours.length) {
			openModal(ModalName.toursProgress);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [completedTours]);

	const startNewTour = async (tourId: string) => {
		setIsStarting(true);
		const newProjectData = await startTour(tourId);
		if (!newProjectData) {
			addToast({
				message: tTours("projectCreationFailed"),
				type: "error",
			});
			return;
		}
		const { projectId, defaultFile } = newProjectData;

		navigate(`/projects/${projectId}`, {
			state: {
				fileToOpen: defaultFile,
			},
		});
		setIsStarting(false);
	};

	return (
		<>
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
			<ToursProgress isStarting={isStarting} onStepSelect={(tourId: string) => startNewTour(tourId)} />
		</>
	);
};
