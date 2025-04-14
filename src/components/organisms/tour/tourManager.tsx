// src/components/organisms/tour/tourManager.tsx
import React, { useEffect } from "react";

import { Placement } from "@floating-ui/react";

import { TourPopover } from "./tourPopover";
import { tours } from "@src/constants";
import { useTourStore } from "@src/store";

export const TourManager = () => {
	const { activeTour, activeStep, nextStep, prevStep, skipTour, isPopoverVisible } = useTourStore();

	// Always render TourPopover, just hide it when no active tour
	const currentTour = activeTour ? tours[activeTour.tourId] : null;
	const currentStep = currentTour?.steps?.[activeTour?.currentStepIndex] || null;

	// Calculate if step is first/last only if we have a tour
	const isFirstStep = activeTour?.currentStepIndex === 0;
	const isLastStep = activeTour?.currentStepIndex === (currentTour?.steps.length || 0) - 1;

	// Default empty props when no tour is active
	const popoverProps = currentStep
		? {
			htmlElementId: currentStep.htmlElementId,
			title: typeof currentStep.title === "string" ? currentStep.title : "",
			content: typeof currentStep.content === "string" ? currentStep.content : "",
			customComponent: currentStep.renderContent ? currentStep.renderContent() : undefined,
			placement: currentStep.placement,
			onPrev: prevStep,
			onSkip: skipTour,
			onNext: nextStep,
			isFirstStep,
			isLastStep,
			hideBack: currentStep.hideBack,
			displayNext: currentStep.displayNext,
			visible: isPopoverVisible,
		}
		: {
			htmlElementId: "",
			title: "",
			content: "",
			placement: "bottom" as Placement,
			onPrev: () => { },
			onSkip: () => { },
			onNext: () => { },
			isFirstStep: true,
			isLastStep: true,
			hideBack: false,
			displayNext: false,
		};

	return <TourPopover key={activeStep?.id} {...popoverProps} />;
};
