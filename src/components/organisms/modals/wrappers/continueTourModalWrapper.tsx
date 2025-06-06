import React from "react";

import { useNavigate } from "react-router-dom";

import { ModalName } from "@enums/components";
import { useModalStore, useTourStore, useToastStore } from "@src/store";

import { ContinueTourModal } from "@components/organisms/tour/continueTourModal";

/**
 * Wrapper component for ContinueTourModal that provides the necessary callbacks
 * This component integrates the modal with the tour store and navigation
 */
export const ContinueTourModalWrapper: React.FC = () => {
	const navigate = useNavigate();
	const { closeModal } = useModalStore();
	const { skipTour: stopTour, activeStep, getLastStepUrl, setPopoverVisible } = useTourStore();
	const { addToast } = useToastStore();

	const continueTour = async () => {
		closeModal(ModalName.continueTour);
		closeModal(ModalName.toursProgress);
		setPopoverVisible(false);
		const lastTourStepUrl = getLastStepUrl();
		if (!lastTourStepUrl) {
			addToast({
				message: "No last step URL found", // TODO: Add proper translation
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

	return <ContinueTourModal onCancel={cancelTour} onContinue={continueTour} />;
};
