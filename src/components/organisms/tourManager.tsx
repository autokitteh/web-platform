import React, { useEffect } from "react";

import { createPortal } from "react-dom";

import { tours } from "@src/constants/tour.constants";
import { useTourActionListener } from "@src/hooks/useTourActionListener";
import { useTourStore } from "@src/store/useTourStore";

import { TourPopover } from "@components/organisms";

export const TourManager: React.FC = () => {
	const { activeTour, prevStep, skipTour } = useTourStore();
	useTourActionListener();

	useEffect(() => {
		// Add overlay when tour is active
		if (activeTour) {
			const overlayElement = document.createElement("div");
			overlayElement.id = "tour-overlay";
			overlayElement.style.position = "fixed";
			overlayElement.style.top = "0";
			overlayElement.style.left = "0";
			overlayElement.style.width = "100%";
			overlayElement.style.height = "100%";
			overlayElement.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
			overlayElement.style.zIndex = "10";
			overlayElement.style.pointerEvents = "none";
			document.body.appendChild(overlayElement);

			// Return cleanup function
			return () => {
				document.body.removeChild(overlayElement);
			};
		}
	}, [activeTour]);

	if (!activeTour) return null;

	const currentTour = tours[activeTour.tourId];
	if (!currentTour) return null;

	const currentStep = currentTour.steps[activeTour.currentStepIndex];
	if (!currentStep) return null;

	const isFirstStep = activeTour.currentStepIndex === 0;

	return createPortal(
		<TourPopover
			content={currentStep.content}
			isFirstStep={isFirstStep}
			isHighlighted={currentStep.highlight}
			onPrev={prevStep}
			onSkip={skipTour}
			placement={currentStep.placement}
			targetId={currentStep.targetElementId}
			title={currentStep.title}
		/>,
		document.body
	);
};
