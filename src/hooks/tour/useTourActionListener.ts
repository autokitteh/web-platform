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
	removeTourOverlay,
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

	const resetTourActionListener = useCallback(() => {
		cleanupAllHighlights();
		processedStepsRef.current.clear();
		prevStepIndexRef.current = null;
		foundElementRef.current = null;
		popoverReadyRef.current = false;
		pollIntervalRef.current = undefined;
		observerRef.current = null;
		removeTourOverlay();
	}, []);

	const handlePopoverReady = useCallback(() => {
		if (!activeStep) return;
		popoverReadyRef.current = true;

		if (!foundElementRef.current) return;

		triggerEvent(EventListenerName.configTourPopoverRef, foundElementRef.current);
	}, [activeStep]);

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

	const cleanupStepResources = useCallback(() => {
		if (pollIntervalRef.current) {
			clearInterval(pollIntervalRef.current);
			pollIntervalRef.current = undefined;
		}

		if (observerRef.current) {
			observerRef.current.disconnect();
			observerRef.current = null;
		}
	}, []);

	const getActionElement = useCallback((htmlElementId: string): HTMLElement | null => {
		return document.getElementById(htmlElementId);
	}, []);

	const cleanupPreviousStep = useCallback((activeTour: TourProgress, currentTour: Tour) => {
		if (activeTour.currentStepIndex > 0) {
			const previousStepId = currentTour.steps[activeTour.currentStepIndex - 1]?.htmlElementId;
			cleanupHighlight(undefined, previousStepId);
		}
	}, []);

	const setupElementForStep = useCallback(
		(actionElement: HTMLElement, currentStep: TourStep): (() => void) | undefined => {
			actionElement.addEventListener("click", nextStep);
			const cleanup = highlightElement(actionElement, currentStep.htmlElementId, !!currentStep.highlight);
			processedStepsRef.current.add(currentStep.id);
			foundElementRef.current = actionElement;
			return cleanup;
		},
		[nextStep]
	);

	const configurePopover = useCallback(
		(actionElement: HTMLElement) => {
			if (!popoverReadyRef.current) return;

			setPopoverVisible(true);
			triggerEvent(EventListenerName.configTourPopoverRef, actionElement);
		},
		[setPopoverVisible]
	);

	const setupListener = useCallback(
		(
			currentStep: TourStep,
			activeTour: TourProgress,
			currentTour: Tour
		): { cleanup?: () => void; element: HTMLElement } | undefined => {
			if (processedStepsRef.current.has(currentStep.id)) return;

			const actionElement = getActionElement(currentStep.htmlElementId);
			if (!actionElement) return;

			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
			}

			cleanupPreviousStep(activeTour, currentTour);

			const cleanup = setupElementForStep(actionElement, currentStep);
			configurePopover(actionElement);

			return { element: actionElement, cleanup };
		},
		[cleanupPreviousStep, configurePopover, getActionElement, setupElementForStep]
	);

	const isStepValidForCurrentPath = useCallback(
		(
			activeTour: TourProgress,
			activeStep: TourStep,
			pathname: string
		): { currentStep: TourStep | null; currentTour: Tour | null; isValid: boolean } => {
			const stepId = activeStep.id;
			if (processedStepsRef.current.has(stepId)) {
				return { isValid: false, currentTour: null, currentStep: null };
			}

			const currentTour = tours[activeTour.tourId];
			if (!currentTour) {
				cleanupAllHighlights();
				return { isValid: false, currentTour: null, currentStep: null };
			}

			const currentStep = activeStep || currentTour.steps[activeTour.currentStepIndex];
			const isStepApplicableToCurrentPath = shouldShowStepOnPath(currentStep, pathname);

			if (!isStepApplicableToCurrentPath) {
				cleanupAllHighlights();
				return { isValid: false, currentTour: null, currentStep: null };
			}

			return { isValid: true, currentTour, currentStep };
		},
		[]
	);

	useEffect(() => {
		if (!activeTour || !activeStep) {
			resetTourActionListener();
			return;
		}

		const { isValid, currentTour, currentStep } = isStepValidForCurrentPath(activeTour, activeStep, pathname);
		if (!isValid || !currentTour || !currentStep) return;

		if (prevStepIndexRef.current !== activeTour.currentStepIndex) {
			prevStepIndexRef.current = activeTour.currentStepIndex;
			foundElementRef.current = null;
		}

		cleanupAllHighlights();
		cleanupStepResources();

		let actionElement: HTMLElement | null = null;
		let elementCleanup: (() => void) | undefined;

		const listenerSetup = setupListener(currentStep, activeTour, currentTour);

		if (listenerSetup) {
			actionElement = listenerSetup.element;
			elementCleanup = listenerSetup.cleanup;
			createTourOverlay();
			return;
		}

		if (!actionElement) {
			observerRef.current = new MutationObserver(() => {
				const observerListenerSetup = setupListener(currentStep, activeTour, currentTour);
				if (observerListenerSetup) {
					if (observerRef.current) observerRef.current.disconnect();
					if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

					actionElement = observerListenerSetup.element;
					elementCleanup = observerListenerSetup.cleanup;
					createTourOverlay();
				}
			});

			observerRef.current.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		return () => {
			const currentActiveStepIndex = tours[activeTour.tourId].steps.findIndex((step) => step === activeStep);
			if (currentActiveStepIndex === activeTour.currentStepIndex) return;

			if (actionElement) {
				actionElement.removeEventListener("click", nextStep);
			}

			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
			}

			if (elementCleanup) {
				elementCleanup();
			}

			removeTourOverlay();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeStep, pathname]);
};
