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
	const {
		skipTour: stopTour,
		activeTour,
		activeStep,
		lastStepUrl,
		setPopoverVisible,
		isPopoverVisible,
	} = useTourStore();
	const { openModal, closeModal } = useModalStore();
	const navigate = useNavigate();
	const { addToast } = useToastStore();
	const { t } = useTranslation("tour", { keyPrefix: "general" });

	const continueTour = () => {
		closeModal(ModalName.continueTour);
		if (!lastStepUrl) {
			addToast({
				message: t("general.noLastStepUrl"),
				type: "error",
			});
			stopTour();
			return;
		}
		if (!isPopoverVisible) {
			setPopoverVisible(true);
		}
		navigate(lastStepUrl);
	};

	const cancelTour = () => {
		closeModal(ModalName.continueTour);
		stopTour();
	};

	useEffect(() => {
		if (!activeTour.tourId) return;

		if (activeStep && !shouldShowStepOnPath(activeStep, location.pathname)) {
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
