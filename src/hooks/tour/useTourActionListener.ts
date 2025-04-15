import { useEffect, useRef } from "react";

import { useLocation } from "react-router-dom";

import { maxRetriesElementGetInterval, tours } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { TourStep, Tour, TourProgress } from "@src/interfaces/store/tour.interface";
import {
	shouldShowStepOnPath,
	cleanupHighlight,
	highlightElement,
	createTourOverlay,
	cleanupAllHighlights,
	removeTourOverlay,
	pollByInterval,
} from "@src/utilities";

import { triggerEvent, useEventListener } from "@hooks";
import { useTourStore } from "@store";

export const useTourActionListener = () => {
	const { nextStep, activeTour, activeStep, setPopoverVisible, setLastStepUrl } = useTourStore();
	const { pathname } = useLocation();
	const prevStepIndexRef = useRef<number | null>(null);
	const processedStepsRef = useRef<Set<string>>(new Set());
	const pollIntervalRef = useRef<number>(0);
	const popoverReadyRef = useRef(false);
	const foundElementRef = useRef<HTMLElement | null>(null);

	const actionElementRef = useRef<HTMLElement | null>(null);
	const elementCleanupRef = useRef<(() => void) | undefined>(undefined);

	const setupListenerAndCreateOverlay = (
		event: CustomEvent<{ step: TourStep; tour: TourProgress; tourData: Tour }>
	) => {
		resetTourActionListener();
		setPopoverVisible(true);
		const { step: activeTourStep, tour, tourData } = event.detail;
		const currentTour = tours[activeTour.tourId];
		const configStep = currentTour.steps.find((step) => step.id === activeTourStep.id);

		if (!configStep) return;

		// Get previous step HTML element ID if it exists
		const previousStepHtmlElementId =
			tour.currentStepIndex > 0 ? tourData.steps[tour.currentStepIndex - 1]?.htmlElementId : undefined;

		const listenerSetup = setupListener(
			configStep.htmlElementId,
			configStep.id,
			!!configStep.highlight,
			tour.currentStepIndex,
			previousStepHtmlElementId
		);

		if (listenerSetup) {
			actionElementRef.current = listenerSetup.element;
			elementCleanupRef.current = listenerSetup.cleanup;
			foundElementRef.current = actionElementRef.current;

			triggerEvent(EventListenerName.configTourPopoverRef, actionElementRef.current);

			createTourOverlay();
			return;
		}

		let attempts = 0;
		pollIntervalRef.current = window.setInterval(() => {
			attempts++;
			const intervalElementListenerSetup = setupListener(
				configStep.htmlElementId,
				configStep.id,
				!!configStep.highlight,
				tour.currentStepIndex,
				previousStepHtmlElementId
			);

			if (intervalElementListenerSetup || attempts >= maxRetriesElementGetInterval) {
				clearInterval(pollIntervalRef.current);
				pollIntervalRef.current = undefined;

				if (intervalElementListenerSetup) {
					setPopoverVisible(true);
					actionElementRef.current = intervalElementListenerSetup.element;
					elementCleanupRef.current = intervalElementListenerSetup.cleanup;
					createTourOverlay();
					foundElementRef.current = actionElementRef.current;
					cleanupStepResources();
				}
			}
		}, 100);
	};

	const resetTourActionListener = () => {
		cleanupAllHighlights();
		processedStepsRef.current.clear();
		prevStepIndexRef.current = null;
		foundElementRef.current = null;
		popoverReadyRef.current = false;
		pollIntervalRef.current = undefined;
		removeTourOverlay();
	};

	const handlePopoverReady = () => {
		if (!activeStep) return;
		popoverReadyRef.current = true;

		if (!foundElementRef.current) return;

		triggerEvent(EventListenerName.configTourPopoverRef, foundElementRef.current);
	};

	const setupPopoverReadyListener = useEventListener(EventListenerName.tourPopoverReady, handlePopoverReady);
	const setupClearTourStepListener = useEventListener(
		EventListenerName.clearTourStepListener,
		resetTourActionListener
	);
	const setupTourStepListener = useEventListener(
		EventListenerName.setupTourStepListener,
		setupListenerAndCreateOverlay
	);

	useEffect(() => {
		const cleanupPopoverReadyListener = setupPopoverReadyListener;
		const cleanupClearTourStepListener = setupClearTourStepListener;
		const cleanupTourStepListener = setupTourStepListener;
		return () => {
			cleanupPopoverReadyListener;
			cleanupClearTourStepListener;
			cleanupTourStepListener;
		};
	}, [setupPopoverReadyListener, setupClearTourStepListener, setupTourStepListener]);

	const cleanupStepResources = () => {
		if (pollIntervalRef.current) {
			clearInterval(pollIntervalRef.current);
			pollIntervalRef.current = undefined;
		}
	};

	const getActionElement = (htmlElementId: string): HTMLElement | null => {
		return document.getElementById(htmlElementId);
	};

	const setupElementForStep = (
		actionElement: HTMLElement,
		htmlElementId: string,
		stepId: string,
		highlight?: boolean
	): (() => void) | undefined => {
		actionElement.addEventListener("click", nextStep);
		setLastStepUrl(location.pathname);
		const cleanup = highlightElement(actionElement, htmlElementId, !!highlight);
		processedStepsRef.current.add(stepId);
		foundElementRef.current = actionElement;
		return cleanup;
	};

	const configurePopover = (actionElement: HTMLElement) => {
		if (!popoverReadyRef.current) return;

		triggerEvent(EventListenerName.configTourPopoverRef, actionElement);
	};

	const setupListener = (
		htmlElementId: string,
		stepId: string,
		highlight?: boolean,
		currentStepIndex?: number,
		previousStepHtmlElementId?: string
	): { cleanup?: () => void; element: HTMLElement } | undefined => {
		if (processedStepsRef.current.has(stepId)) return;

		const actionElement = getActionElement(htmlElementId);
		if (!actionElement) return;
		setPopoverVisible(true);

		if (currentStepIndex && currentStepIndex > 0 && previousStepHtmlElementId) {
			cleanupHighlight(undefined, previousStepHtmlElementId);
		}

		const cleanup = setupElementForStep(actionElement, htmlElementId, stepId, highlight);

		if (popoverReadyRef.current) {
			configurePopover(actionElement);
		}

		return { element: actionElement, cleanup };
	};

	const isStepValidForCurrentPath = (
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

		const configStep = currentTour.steps.find((step) => step.id === stepId);
		if (!configStep) {
			cleanupAllHighlights();
			return { isValid: false, currentTour: null, currentStep: null };
		}

		const isStepApplicableToCurrentPath = shouldShowStepOnPath(configStep, pathname);

		if (!isStepApplicableToCurrentPath) {
			cleanupAllHighlights();
			return { isValid: false, currentTour: null, currentStep: null };
		}

		return { isValid: true, currentTour, currentStep: configStep };
	};

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

		const previousStepHtmlElementId =
			activeTour.currentStepIndex > 0
				? currentTour.steps[activeTour.currentStepIndex - 1]?.htmlElementId
				: undefined;

		const listenerSetup = setupListener(
			currentStep.htmlElementId,
			currentStep.id,
			!!currentStep.highlight,
			activeTour.currentStepIndex,
			previousStepHtmlElementId
		);

		if (listenerSetup) {
			actionElementRef.current = listenerSetup.element;
			elementCleanupRef.current = listenerSetup.cleanup;
			createTourOverlay();
		} else {
			pollByInterval(
				currentStep.htmlElementId,
				currentStep.id,
				!!currentStep.highlight,
				activeTour.currentStepIndex,
				pollIntervalRef,
				foundElementRef,
				setupListener,
				previousStepHtmlElementId
			);
		}

		return () => {
			const currentActiveStepIndex = tours[activeTour.tourId].steps.findIndex((step) => step === activeStep);
			if (currentActiveStepIndex === activeTour.currentStepIndex) return;

			if (actionElementRef.current) {
				actionElementRef.current.removeEventListener("click", nextStep);
			}

			cleanupStepResources();

			if (elementCleanupRef.current) {
				elementCleanupRef.current();
			}

			removeTourOverlay();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeStep, pathname]);
};
