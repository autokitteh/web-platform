import React, { useEffect, useState } from "react";

import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";

import { tours } from "@src/constants/tour.constants";
import { useTourActionListener } from "@src/hooks";
import { useTourStore } from "@src/store/useTourStore";
import { cn, shouldShowStepOnPath } from "@src/utilities";

import { TourPopover } from "@components/organisms";

export const TourManager = () => {
	const { activeTour, prevStep, skipTour, nextStep } = useTourStore();
	const location = useLocation();
	const [isTourStepVisible, setIsTourStepVisible] = useState(false);
	useTourActionListener();

	useEffect(() => {
		// This effect will run on every page reload (component mount)
		if (activeTour) {
			const overlay = document.getElementById("tour-overlay");
			if (overlay) {
				const currentTour = tours[activeTour.tourId];
				if (currentTour) {
					const currentStep = currentTour.steps[activeTour.currentStepIndex];
					if (currentStep && currentStep.id) {
						const element = document.getElementById(currentStep.id);
						if (element) {
							element.dataset.tourHighlight = "true";
							element.style.position = "relative";
							element.style.zIndex = "100";
						}
					}
				}
			}
		}

		return () => {
			// Cleanup code here
			if (activeTour) {
				const highlightedElements = document.querySelectorAll('[data-tour-highlight="true"]');
				highlightedElements.forEach((el) => {
					const htmlElement = el as HTMLElement;
					delete htmlElement.dataset.tourHighlight;
					htmlElement.style.removeProperty("position");
					htmlElement.style.removeProperty("z-index");
				});
			}
		};
	}, [activeTour]);

	useEffect(() => {
		if (!activeTour) return;

		const currentTour = tours[activeTour.tourId];
		if (!currentTour) return;

		const currentStep = currentTour.steps[activeTour.currentStepIndex];
		if (!currentStep) return;

		const isStepApplicableToCurrentPath = shouldShowStepOnPath(currentStep, location.pathname);
		setIsTourStepVisible(isStepApplicableToCurrentPath);

		if (isStepApplicableToCurrentPath) {
			const overlayElement = document.createElement("div");
			overlayElement.id = "tour-overlay";
			overlayElement.className = cn("fixed inset-0 z-40 size-full bg-black/30");
			document.body.appendChild(overlayElement);

			return () => {
				document.body.removeChild(overlayElement);
			};
		}
	}, [activeTour, location.pathname]);

	if (!activeTour || !isTourStepVisible) return null;

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
