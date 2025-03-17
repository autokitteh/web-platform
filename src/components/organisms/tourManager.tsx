import React from "react";

import { createPortal } from "react-dom";

import { tours } from "@src/constants";
import { useTourStore } from "@src/store/useTourStore";

import { TourPopover } from "@components/organisms";

export const TourManager = () => {
	const { activeTourId, activeStepIndex, nextStep, prevStep, skipTour } = useTourStore();

	if (!activeTourId) return null;

	const currentTour = tours[activeTourId];
	if (!currentTour) return null;

	const currentStep = currentTour.steps[activeStepIndex];
	if (!currentStep) return null;

	const isFirstStep = activeStepIndex === 0;
	const isLastStep = activeStepIndex === currentTour.steps.length - 1;

	return createPortal(
		<TourPopover
			content={currentStep.content}
			isFirstStep={isFirstStep}
			isHighlighted={currentStep.highlight}
			isLastStep={isLastStep}
			onNext={() => nextStep(currentTour.steps.length)}
			onPrev={prevStep}
			onSkip={skipTour}
			placement={currentStep.placement}
			targetId={currentStep.targetElementId}
			title={currentStep.title}
		/>,
		document.body
	);
};
