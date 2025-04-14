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
	const processedElementsRef = useRef<Set<string>>(new Set());
	const pollIntervalRef = useRef<number>();
	const observerRef = useRef<MutationObserver | null>(null);
	const popoverReadyRef = useRef(false);
	const foundElementRef = useRef<HTMLElement | null>(null);

	const handlePopoverReady = useCallback(() => {
		console.log("Popover ready event received");
		popoverReadyRef.current = true;

		if (!foundElementRef.current) {
			console.log("Element not found yet when popover became ready");
			return;
		}
		
		console.log("Element found, setting popover visible and configuring reference");
		setPopoverVisible(true);
		triggerEvent(EventListenerName.configTourPopoverRef, foundElementRef.current);
	}, [setPopoverVisible]);

	useEventListener(EventListenerName.tourPopoverReady, handlePopoverReady);

	const resetHookData = () => {
		cleanupAllHighlights();
		setPopoverVisible(false);

		processedElementsRef.current.clear();
		prevStepIndexRef.current = null;
		foundElementRef.current = null;
	};

	const setupListener = (currentStep: TourStep, elementKey: string, activeTour: TourProgress, currentTour: Tour): {element: HTMLElement, cleanup?: (() => void)} | undefined => {
		if (processedElementsRef.current.has(elementKey)) {
				console.log(`Element ${elementKey} already processed`);
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
				processedElementsRef.current.add(elementKey);

				foundElementRef.current = actionElement;

				if (popoverReadyRef.current) {
					setPopoverVisible(true);
					triggerEvent(EventListenerName.configTourPopoverRef, actionElement);
					
					console.log(`Element found and popover was ready, showing immediately`);
				} else {
					console.log(`Element found but waiting for popover to be ready`);
				}

				return { element: actionElement, cleanup };
		}


	useEffect(() => {
		let overlayElement: HTMLElement | undefined = undefined;

		if (!activeTour || !activeStep) {
			resetHookData();
			return;
		}

		const currentTour = tours[activeTour.tourId];
		if (!currentTour) {
			cleanupAllHighlights();
			return;
		}

		const currentStep = activeStep || currentTour.steps[activeTour.currentStepIndex];
		if (!currentStep) {
			cleanupAllHighlights();
			return;
		}

		const isStepApplicableToCurrentPath = shouldShowStepOnPath(currentStep, pathname);
		if (!isStepApplicableToCurrentPath) {
			setPopoverVisible(false);
		    cleanupAllHighlights();
			return;
		}

		if (prevStepIndexRef.current !== activeTour.currentStepIndex) {
			processedElementsRef.current.clear();
			prevStepIndexRef.current = activeTour.currentStepIndex;
			foundElementRef.current = null;
		}

		const elementKey = currentStep.id;

		if (processedElementsRef.current.has(elementKey)) return;

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

		const firstTryListenerSetup = setupListener(currentStep, elementKey, activeTour, currentTour);

		if (firstTryListenerSetup) {
			actionElement = firstTryListenerSetup.element;
			triggerEvent(EventListenerName.configTourPopoverRef, firstTryListenerSetup.element);
			elementCleanup = firstTryListenerSetup.cleanup;
		} else {
			observerRef.current = new MutationObserver(() => {
				const observerListenerSetup = setupListener(currentStep, elementKey, activeTour, currentTour);
				if (observerListenerSetup) {
					if (observerRef.current) observerRef.current.disconnect();
					if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

					actionElement = observerListenerSetup.element;
					elementCleanup = observerListenerSetup.cleanup;
				}
			});

			observerRef.current.observe(document.body, {
				childList: true,
				subtree: true,
			});

			let attempts = 0;
			const maxAttempts = 50;

			pollIntervalRef.current = window.setInterval(() => {
				attempts++;
				const intervalElementListenerSetup = setupListener(currentStep, elementKey, activeTour, currentTour);

				if ((intervalElementListenerSetup || attempts >= maxAttempts)) {
					clearInterval(pollIntervalRef.current);
					pollIntervalRef.current = undefined;

					if (intervalElementListenerSetup) {
						actionElement = intervalElementListenerSetup.element;
						elementCleanup = intervalElementListenerSetup.cleanup;
						overlayElement = createTourOverlay();
						foundElementRef.current = actionElement;
					}
				}
			}, 100);
		}

		return () => {
			if (actionElement) {
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
