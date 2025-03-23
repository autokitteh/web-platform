import { useEffect } from "react";

import { delayedSteps, tours } from "@src/constants";
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

		const handleClick = () => {
			if (delayedSteps.includes(currentStep.id)) {
				setTimeout(() => {
					nextStep();
				}, 700);
				return;
			}
			nextStep();
		};

		actionElement.addEventListener("click", handleClick);

		return () => {
			actionElement.removeEventListener("click", handleClick);
		};
	}, [activeTour, nextStep]);
};
