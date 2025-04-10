import React from "react";

import { createPortal } from "react-dom";

import { tours } from "@src/constants/tour.constants";
import { useTourStore } from "@src/store/useTourStore";

import { TourPopover } from "@components/organisms";

export const TourManager = () => {
	const { activeTour, prevStep, skipTour, nextStep } = useTourStore();

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
			hideBack={currentStep.hideBack}
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
