/* eslint-disable no-console */
import { useEffect, useRef, useCallback } from "react";

import { useLocation } from "react-router-dom";

import { tours } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { TourStep, Tour, TourProgress } from "@src/interfaces/store/tour.interface";
import {
	shouldShowStepOnPath,
	cleanupHighlight,
	highlightElement,
	createTourOverlay,
	cleanupAllHighlights,
} from "@src/utilities";

import { triggerEvent, useEventListener } from "@hooks";
import { useTourStore } from "@store";

export const useTourActionListener = () => {
	const { nextStep, activeTour, activeStep, setPopoverVisible } = useTourStore();
	const { pathname } = useLocation();
	const prevStepIndexRef = useRef<number | null>(null);
	const processedStepsRef = useRef<Set<string>>(new Set());
	const pollIntervalRef = useRef<number>();
	const observerRef = useRef<MutationObserver | null>(null);
	const popoverReadyRef = useRef(false);
	const foundElementRef = useRef<HTMLElement | null>(null);

	const resetTourActionListener = () => {
		cleanupAllHighlights();
		processedStepsRef.current.clear();
		prevStepIndexRef.current = null;
		foundElementRef.current = null;
		popoverReadyRef.current = false;
		pollIntervalRef.current = undefined;
		observerRef.current = null;
	};

	const handlePopoverReady = useCallback(() => {
		if (!activeStep) return;
		popoverReadyRef.current = true;

		if (!foundElementRef.current) {
			return;
		}

		triggerEvent(EventListenerName.configTourPopoverRef, foundElementRef.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeStep, pathname]);

	const setupPopoverReadyListener = useEventListener(EventListenerName.tourPopoverReady, handlePopoverReady);
	const setupClearTourStepListener = useEventListener(
		EventListenerName.clearTourStepListener,
		resetTourActionListener
	);

	useEffect(() => {
		const cleanupPopoverReadyListener = setupPopoverReadyListener;
		const cleanupClearTourStepListener = setupClearTourStepListener;
		return () => {
			cleanupPopoverReadyListener;
			cleanupClearTourStepListener;
		};
	}, [setupPopoverReadyListener, setupClearTourStepListener]);

	const setupListener = (
		currentStep: TourStep,
		activeTour: TourProgress,
		currentTour: Tour
	): { cleanup?: () => void; element: HTMLElement } | undefined => {
		if (processedStepsRef.current.has(currentStep.id)) {
			console.log(`Element ${currentStep.id} already processed`);
			return;
		}

		const actionElement = document.getElementById(currentStep.htmlElementId);

		if (!actionElement) {
			return;
		}

		console.log(`Found element: ${currentStep.htmlElementId}`);

		if (observerRef.current) {
			observerRef.current.disconnect();
			observerRef.current = null;
		}

		actionElement.addEventListener("click", nextStep);

		if (activeTour.currentStepIndex > 0) {
			const previousStepId = currentTour.steps[activeTour.currentStepIndex - 1]?.htmlElementId;
			cleanupHighlight(undefined, previousStepId);
		}

		const cleanup = highlightElement(actionElement, currentStep.htmlElementId, !!currentStep.highlight);
		processedStepsRef.current.add(currentStep.id);

		foundElementRef.current = actionElement;

		if (popoverReadyRef.current) {
			setPopoverVisible(true);
			triggerEvent(EventListenerName.configTourPopoverRef, actionElement);

			console.log(`Element found and popover was ready, showing immediately`);
		} else {
			console.log(`Element found but waiting for popover to be ready`);
		}

		return { element: actionElement, cleanup };
	};

	useEffect(() => {
		let overlayElement: HTMLElement | undefined = undefined;

		if (!activeTour || !activeStep) {
			resetTourActionListener();
			return;
		}

		const elementKey = activeStep.htmlElementId;
		const stepId = activeStep.id;
		if (processedStepsRef.current.has(stepId)) return;

		const currentTour = tours[activeTour.tourId];
		if (!currentTour) {
			cleanupAllHighlights();
			return;
		}

		const currentStep = activeStep || currentTour.steps[activeTour.currentStepIndex];

		const isStepApplicableToCurrentPath = shouldShowStepOnPath(currentStep, pathname);
		if (!isStepApplicableToCurrentPath) {
			cleanupAllHighlights();
			return;
		}

		if (prevStepIndexRef.current !== activeTour.currentStepIndex) {
			prevStepIndexRef.current = activeTour.currentStepIndex;
			foundElementRef.current = null;
		}

		cleanupAllHighlights();

		if (pollIntervalRef.current) {
			clearInterval(pollIntervalRef.current);
			pollIntervalRef.current = undefined;
		}

		if (observerRef.current) {
			observerRef.current.disconnect();
			observerRef.current = null;
		}

		let actionElement: HTMLElement | null = null;
		let elementCleanup: (() => void) | undefined;

		const firstTryListenerSetup = setupListener(currentStep, activeTour, currentTour);

		if (firstTryListenerSetup) {
			actionElement = firstTryListenerSetup.element;
			elementCleanup = firstTryListenerSetup.cleanup;
			overlayElement = createTourOverlay();
		} else {
			let elementFound = false;

			observerRef.current = new MutationObserver(() => {
				if (elementFound) return;

				const observerListenerSetup = setupListener(currentStep, activeTour, currentTour);
				if (observerListenerSetup) {
					elementFound = true;
					if (observerRef.current) observerRef.current.disconnect();
					if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

					actionElement = observerListenerSetup.element;
					elementCleanup = observerListenerSetup.cleanup;
					overlayElement = createTourOverlay();
				}
			});

			observerRef.current.observe(document.body, {
				childList: true,
				subtree: true,
			});

			let attempts = 0;
			const maxAttempts = 50;

			pollIntervalRef.current = window.setInterval(() => {
				if (elementFound) {
					clearInterval(pollIntervalRef.current);
					pollIntervalRef.current = undefined;
					return;
				}

				attempts++;
				const intervalElementListenerSetup = setupListener(currentStep, activeTour, currentTour);

				if (intervalElementListenerSetup || attempts >= maxAttempts) {
					elementFound = true;
					clearInterval(pollIntervalRef.current);
					pollIntervalRef.current = undefined;

					if (intervalElementListenerSetup) {
						actionElement = intervalElementListenerSetup.element;
						elementCleanup = intervalElementListenerSetup.cleanup;
						overlayElement = createTourOverlay();
						foundElementRef.current = actionElement;

						if (observerRef.current) {
							observerRef.current.disconnect();
							observerRef.current = null;
						}
					}
				}
			}, 100);
		}

		return () => {
			const currentActiveStepIndex = tours[activeTour.tourId].steps.findIndex((step) => step === activeStep);
			if (currentActiveStepIndex === activeTour.currentStepIndex) {
				return;
			}
			console.log("currentActiveStepIndex", currentActiveStepIndex);
			console.log("activeTourStepIndex", activeTour.currentStepIndex);
			if (actionElement) {
				console.log(`Removing listener for ${elementKey}`);
				actionElement.removeEventListener("click", nextStep);
			}

			if (elementCleanup) {
				elementCleanup();
			}

			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
			}

			if (pollIntervalRef.current) {
				clearInterval(pollIntervalRef.current);
				pollIntervalRef.current = undefined;
			}

			if (overlayElement && overlayElement.parentNode) {
				document.body.removeChild(overlayElement);
			}
		};
	}, [activeStep, pathname]);
};
