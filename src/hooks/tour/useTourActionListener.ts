import { useEffect, useRef } from "react";

import { useLocation } from "react-router-dom";

import { delayedSteps, tours } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { shouldShowStepOnPath } from "@src/utilities";
import { cleanupHighlight, highlightElement, createTourOverlay } from "@src/utilities/domTourHighight.utils";

import { triggerEvent } from "@hooks";
import { useTourStore } from "@store";

export const useTourActionListener = () => {
	const { nextStep, activeTour } = useTourStore();
	const { pathname } = useLocation();
	const previousStepIdRef = useRef<string | null>(null);

	useEffect(() => {
		if (previousStepIdRef.current) {
			cleanupHighlight(previousStepIdRef.current);
			previousStepIdRef.current = null;
		}

		if (!activeTour) {
			const elements = document.querySelectorAll('[data-tour-highlight="true"]');
			elements.forEach((el) => {
				if (el.id) {
					cleanupHighlight(el.id);
				}
			});
		}
	}, [activeTour]);

	useEffect(() => {
		if (!activeTour) return;

		const currentTour = tours[activeTour.tourId];
		if (!currentTour) return;

		const currentStep = currentTour.steps[activeTour.currentStepIndex];
		if (!currentStep || !currentStep.id) {
			triggerEvent(EventListenerName.clearTourHighlight);
			return;
		}

		previousStepIdRef.current = currentStep.id;

		const isStepApplicableToCurrentPath = shouldShowStepOnPath(currentStep, pathname);
		if (!isStepApplicableToCurrentPath) {
			cleanupHighlight();
			return;
		}

		const elements = document.querySelectorAll('[data-tour-highlight="true"]');
		elements.forEach((el) => {
			if (el.id && el.id !== currentStep.id) {
				cleanupHighlight(el.id);
			}
		});

		const overlayElement = createTourOverlay();

		const handleClick = () => {
			if (delayedSteps.includes(currentStep.id)) {
				setTimeout(() => {
					nextStep();
				}, 700);
				return;
			}
			nextStep();
		};

		let actionElement: HTMLElement | null = null;
		let observer: MutationObserver | null = null;
		let cleanup: (() => void) | undefined;

		const setupListener = () => {
			actionElement = document.getElementById(currentStep.id);

			if (actionElement) {
				if (observer) {
					observer.disconnect();
					observer = null;
				}

				actionElement.addEventListener("click", handleClick);

				if (activeTour.currentStepIndex > 0) {
					const previousStepId = currentTour.steps[activeTour.currentStepIndex - 1]?.id;
					cleanupHighlight(undefined, previousStepId);
				}
				cleanup = highlightElement(actionElement, currentStep.id, true);

				triggerEvent(EventListenerName.tourElementFound);

				return true;
			}
			return false;
		};

		if (!setupListener()) {
			observer = new MutationObserver(() => {
				if (setupListener()) {
					observer?.disconnect();
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		return () => {
			if (actionElement) {
				actionElement.removeEventListener("click", handleClick);
			}

			if (cleanup) {
				cleanup();
			}

			if (observer) {
				observer.disconnect();
			}

			if (overlayElement && overlayElement.parentNode) {
				document.body.removeChild(overlayElement);
			}
		};
	}, [activeTour, nextStep, pathname]);
};
