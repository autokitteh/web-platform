import React from "react";

import { emptyTourStep, tours } from "@src/constants";
import { TourStep } from "@src/interfaces/store";
import { useTourStore } from "@src/store";

import { TourPopover } from "@components/organisms";

export const TourManager = () => {
	const { activeTour, activeStep, nextStep, prevStep, skipTour, isPopoverVisible } = useTourStore();

	const currentTour = activeTour ? tours[activeTour.tourId] : null;

	const isFirstStep = activeTour?.currentStepIndex === 0;
	const isLastStep = activeTour?.currentStepIndex === (currentTour?.steps.length || 0) - 1;

	const currentStepToPopover = (step?: TourStep) => {
		if (!step) return emptyTourStep;
		return {
			htmlElementId: step.htmlElementId,
			title: typeof step.title === "string" ? step.title : "",
			content: typeof step.content === "string" ? step.content : "",
			customComponent: step.renderContent ? step.renderContent() : undefined,
			placement: step.placement,
			onPrev: prevStep,
			onSkip: skipTour,
			onNext: nextStep,
			isFirstStep,
			isLastStep,
			hideBack: step.hideBack,
			displayNext: step.displayNext,
			visible: isPopoverVisible,
		};
	};

	if (!activeStep) return null;
	const currentStepToPopoverProps = currentStepToPopover(activeStep);
	return <TourPopover key={activeStep?.id} {...currentStepToPopoverProps} />;
};
