import { useEffect } from "react";

import { delayedSteps } from "@src/constants";
import { useTourStep } from "@src/hooks/tour";
import { useTourStore } from "@src/store/useTourStore";

export const useTourActionListener = () => {
	const { nextStep } = useTourStore();
	const { currentStep } = useTourStep();

	useEffect(() => {
		if (!currentStep || !currentStep.id) return;

		const actionElement = document.getElementById(currentStep.id);
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
	}, [currentStep, nextStep]);
};
