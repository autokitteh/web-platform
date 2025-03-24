import React, { useEffect } from "react";

import { createPortal } from "react-dom";

import { tours } from "@src/constants/tour.constants";
import { useTourActionListener } from "@src/hooks/useTourActionListener";
import { useTourStore, useModalStore } from "@src/store";
import { cn } from "@src/utilities";

import { TourPopover } from "@components/organisms";

export const TourManager: React.FC = () => {
	const { activeTour, prevStep, skipTour, nextStep, shouldShowNextStepModal } = useTourStore();
	useTourActionListener();
	const { openModal } = useModalStore();

	useEffect(() => {
		if (activeTour) {
			// Create the overlay
			const overlayElement = document.createElement("div");
			overlayElement.id = "tour-overlay";
			overlayElement.className = cn("fixed inset-0 z-40 size-full bg-black/30");

			document.body.appendChild(overlayElement);

			return () => {
				document.body.removeChild(overlayElement);
			};
		}
	}, [activeTour]);

	useEffect(() => {
		if (shouldShowNextStepModal) {
			openModal("nextStepModal");
			// Optional: Reset the flag after showing modal
			useTourStore.getState().setShouldShowNextStepModal(false);
		}
	}, [shouldShowNextStepModal, openModal]);

	if (!activeTour) return null;

	const currentTour = tours[activeTour.tourId];
	if (!currentTour) return null;

	const currentStep = currentTour.steps[activeTour.currentStepIndex];
	if (!currentStep) return null;

	const isFirstStep = activeTour.currentStepIndex === 0;
	const isLastStep = activeTour.currentStepIndex === currentTour.steps.length - 1;

	return createPortal(
		<TourPopover
			content={currentStep.content}
			customComponent={currentStep?.renderContent?.()}
			displayNext={currentStep?.displayNext}
			isFirstStep={isFirstStep}
			isHighlighted={currentStep.highlight}
			isLastStep={isLastStep}
			onNext={nextStep}
			onPrev={prevStep}
			onSkip={skipTour}
			placement={currentStep.placement}
			targetId={currentStep.id}
			title={currentStep.title}
		/>,
		document.body
	);
};
