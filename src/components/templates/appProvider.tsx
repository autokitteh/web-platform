import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { tours } from "@constants/tour.constants";
import { ModalName } from "@enums/components";
import { AppProviderProps } from "@interfaces/components";
import { shouldShowStepOnPath } from "@utilities";

import { useModalStore, useProjectStore, useToastStore, useTourStore } from "@store";

import { Toast } from "@components/molecules";
import { TourManager } from "@components/organisms";
import { ContinueTourModal } from "@components/organisms/tour/continueTourModal";

export const AppProvider = ({ children }: AppProviderProps) => {
	const {
		skipTour: stopTour,
		activeTour,
		activeStep,
		getLastStepUrl,
		setPopoverVisible,
		tourProjectId,
	} = useTourStore();
	const { openModal, closeModal } = useModalStore();
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();
	const { addToast } = useToastStore();
	const { t } = useTranslation("tour", { keyPrefix: "general" });

	const continueTour = async () => {
		closeModal(ModalName.continueTour);
		closeModal(ModalName.toursProgress);
		setPopoverVisible(false);
		const lastTourStepUrl = getLastStepUrl();
		if (!lastTourStepUrl) {
			addToast({
				message: t("noLastStepUrl"),
				type: "error",
			});
			stopTour();
			return;
		}
		if (!activeStep) return;

		navigate(lastTourStepUrl, { state: { startAbandonedTour: true } });
	};

	const cancelTour = () => {
		closeModal(ModalName.continueTour);
		stopTour();
	};

	useEffect(() => {
		if (!activeTour.tourId || !activeStep) return;
		const currentTour = tours[activeTour.tourId];
		const configStep = currentTour.steps.find((step) => step.id === activeStep.id);
		const tourProjectExists = projectsList.find((project) => project.id === tourProjectId);
		if (configStep && !shouldShowStepOnPath(configStep, location.pathname) && !!tourProjectExists) {
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
