import { useEffect, useRef } from "react";

import { useLocation } from "react-router-dom";

import { tours } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { TourStep, Tour, TourProgress } from "@src/interfaces/store/tour.interface";
import { shouldShowStepOnPath } from "@src/utilities";
import { cleanupHighlight, highlightElement, createTourOverlay } from "@src/utilities/domTourHighight.utils";

import { triggerEvent } from "@hooks";
import { useTourStore } from "@store";

export const useTourActionListener = () => {
	const { nextStep, activeTour } = useTourStore();
	const { pathname } = useLocation();
	// Store the previous step index to detect changes
	const prevStepIndexRef = useRef<number | null>(null);
	// Track which elements have been processed
	const processedElementsRef = useRef<Set<string>>(new Set());
	const processedSteps = [];

	const handleTourEnd = () => {
		triggerEvent(EventListenerName.hideTourPopover);
		processedElementsRef.current.clear();
		prevStepIndexRef.current = null;
		cleanupHighlight();
	};

	// Clear processed elements when tour changes or ends
	useEffect(() => {
		triggerEvent(EventListenerName.hideTourPopover);

		if (!activeTour) {
			const elements = document.querySelectorAll('[data-tour-highlight="true"]');
			elements.forEach((el) => {
				if (el.id) {
					cleanupHighlight(el.id);
					triggerEvent(EventListenerName.hideTourPopover);
				}
			});
			processedElementsRef.current.clear();
			prevStepIndexRef.current = null;
			return;
		}
		const currentTour = tours[activeTour.tourId];

		const isStepApplicableToCurrentPath = currentTour
			? shouldShowStepOnPath(currentTour.steps[activeTour.currentStepIndex], pathname)
			: false;

		if (!isStepApplicableToCurrentPath) {
			handleTourEnd();
			return;
		}

		// Check if step index changed
		if (prevStepIndexRef.current !== activeTour.currentStepIndex) {
			console.log(`Step index changed from ${prevStepIndexRef.current} to ${activeTour.currentStepIndex}`);
			// Reset processed elements when step changes
			processedElementsRef.current.clear();
			prevStepIndexRef.current = activeTour.currentStepIndex;
		}

		if (!currentTour) return;

		const currentStep = currentTour.steps[activeTour.currentStepIndex];
		return handleTourElementFound(activeTour, currentStep, currentTour, pathname);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTour, pathname]);

	const handleTourElementFound = (
		activeTour: TourProgress,
		currentStep: TourStep,
		currentTour: Tour,
		pathname: string
	) => {
		if (!currentStep || !currentStep.id) {
			triggerEvent(EventListenerName.clearTourHighlight);
			return;
		}

		// Create a unique identifier for the step
		const elementKey = `${currentStep.id}`;
		if (processedElementsRef.current.has(elementKey)) return;

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
			nextStep();
		};

		let actionElement: HTMLElement | null = null;
		let observer: MutationObserver | null = null;
		let cleanup: (() => void) | undefined;

		const setupListener = () => {
			// Only check if we've already processed this specific element ID
			if (processedElementsRef.current.has(elementKey)) {
				console.log(`Element ${elementKey} already processed`);
				return true;
			}

			console.log("Looking for element with ID:", currentStep.id);
			actionElement = document.getElementById(currentStep.id);
			console.log("Found element:", actionElement);

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

				// Mark this element as processed
				processedElementsRef.current.add(elementKey);

				// Trigger the event
				triggerEvent(EventListenerName.tourElementFound);
				console.log(`Triggered tourElementFound for element ${elementKey}`);

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

			let attempts = 0;
			const maxAttempts = 50;
			const pollInterval = setInterval(() => {
				attempts++;
				if (setupListener() || attempts >= maxAttempts) {
					clearInterval(pollInterval);
					console.log(`Element found after ${attempts} attempts:`, !!actionElement);
				}
			}, 100);

			const originalCleanup = cleanup;
			cleanup = () => {
				if (originalCleanup) originalCleanup();
				clearInterval(pollInterval);
			};
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
	};
};
