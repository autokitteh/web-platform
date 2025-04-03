import { useEffect } from "react";

import { delayedSteps } from "@src/constants";
import { useTourStep } from "@src/hooks/tour";
import { useTourStore } from "@src/store/useTourStore";

export const useTourActionListener = () => {
	const { nextStep } = useTourStore();
	const { currentStep } = useTourStep();

	useEffect(() => {
		if (!currentStep || !currentStep.id) return;

		let actionElement: HTMLElement | null = null;
		let observer: MutationObserver | null = null;

		const handleClick = () => {
			if (delayedSteps.includes(currentStep.id)) {
				setTimeout(() => {
					nextStep();
				}, 700);
				return;
			}
			nextStep();
		};

		const setupListener = () => {
			actionElement = document.getElementById(currentStep.id);

			if (actionElement) {
				if (observer) {
					observer.disconnect();
					observer = null;
				}
				actionElement.addEventListener("click", handleClick);
				return true;
			}
			return false;
		};

		// Try immediately first
		if (!setupListener()) {
			// If element not found, watch for DOM changes
			observer = new MutationObserver(() => {
				if (setupListener()) {
					observer?.disconnect();
				}
			});

			// Start observing the document body for changes
			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		return () => {
			if (observer) {
				observer.disconnect();
			}
			if (actionElement) {
				actionElement.removeEventListener("click", handleClick);
			}
		};
	}, [currentStep, nextStep]);
};
