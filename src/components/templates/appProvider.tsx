import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { tours } from "@src/constants/tour.constants";
import { ModalName } from "@src/enums/components";
import { AppProviderProps } from "@src/interfaces/components";
import { useModalStore, useToastStore, useTourStore } from "@src/store";
import { shouldShowStepOnPath } from "@src/utilities";

import { Toast } from "@components/molecules";
import { TourManager } from "@components/organisms";
import { ContinueTourModal } from "@components/organisms/tour/continueTourModal";

export const AppProvider = ({ children }: AppProviderProps) => {
	const { skipTour: stopTour, activeTour, activeStep, lastStepUrl, setPopoverVisible } = useTourStore();
	const { openModal, closeModal } = useModalStore();
	const navigate = useNavigate();
	const { addToast } = useToastStore();
	const { t } = useTranslation("tour", { keyPrefix: "general" });

	const continueTour = async () => {
		closeModal(ModalName.continueTour);
		closeModal(ModalName.toursProgress);
		setPopoverVisible(false);
		if (!lastStepUrl) {
			addToast({
				message: t("noLastStepUrl"),
				type: "error",
			});
			stopTour();
			return;
		}
		if (!activeStep) return;

		navigate(lastStepUrl, {
			state: {
				restartTourParams: {
					stepId: activeStep.id,
					tourId: activeTour.tourId,
				},
			},
		});
	};

	const cancelTour = () => {
		closeModal(ModalName.continueTour);
		stopTour();
	};

	useEffect(() => {
		if (!activeTour.tourId || !activeStep) return;
		const currentTour = tours[activeTour.tourId];
		const configStep = currentTour.steps.find((step) => step.id === activeStep.id);

		if (configStep && !shouldShowStepOnPath(configStep, location.pathname)) {
			openModal(ModalName.continueTour, { name: tours?.[activeTour?.tourId]?.name });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			{children}
			<Toast />
			<TourManager />
			<ContinueTourModal onCancel={cancelTour} onContinue={continueTour} />
		</>
	);
};
