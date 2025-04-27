import React from "react";

import { emptyTourStep, tours } from "@constants";
import { TourStep } from "@interfaces/store";

import { useTourStore } from "@store";

import { TourPopover } from "@components/organisms";

export const TourManager = () => {
	const { activeTour, activeStep, nextStep, prevStep, skipTour, isPopoverVisible } = useTourStore();

	if (!activeTour.tourId || !activeStep) return null;
	const currentTour = tours[activeTour.tourId];
	const configStep = currentTour.steps.find((step) => step.id === activeStep.id);
	const isFirstStep = activeTour?.currentStepIndex === 0;
	const isLastStep = activeTour?.currentStepIndex === (currentTour?.steps.length || 0) - 1;

	const currentStepToPopover = (step?: TourStep) => {
		if (!step) return emptyTourStep;
		return {
			htmlElementId: step.htmlElementId,
			title: step.title,
			content: step.content,
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

	const currentStepToPopoverProps = currentStepToPopover(configStep);
	return <TourPopover key={activeStep?.id} {...currentStepToPopoverProps} />;
};
