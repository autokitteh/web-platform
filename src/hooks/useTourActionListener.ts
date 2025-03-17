import { useEffect } from "react";

import { tours } from "@src/constants/tour.constants";
import { useTourStore } from "@src/store/useTourStore";

export const useTourActionListener = () => {
	const { activeTour, nextStep } = useTourStore();

	useEffect(() => {
		if (!activeTour) return;

		const currentTour = tours[activeTour.tourId];
		if (!currentTour) return;

		const currentStep = currentTour.steps[activeTour.currentStepIndex];
		if (!currentStep || !currentStep.actionElementId) return;

		const actionElement = document.getElementById(currentStep.actionElementId);
		if (!actionElement) return;

		actionElement.addEventListener("click", nextStep);

		return () => {
			actionElement.removeEventListener("click", nextStep);
		};
	}, [activeTour, nextStep]);
};
