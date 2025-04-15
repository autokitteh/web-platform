import { useEffect, useRef, useState } from "react";

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
	pollByInterval,
} from "@src/utilities";

import { triggerEvent, useEventListener } from "@hooks";
import { useTourStore } from "@store";

export const useTourActionListener = () => {
	const { nextStep, activeTour, activeStep, setPopoverVisible, setLastStepUrl, skipTour } = useTourStore();
	const { pathname } = useLocation();
	const prevStepIndexRef = useRef<number | null>(null);
	const processedStepsRef = useRef<Set<string>>(new Set());
	const pollIntervalRef = useRef<number>(0);
	const [popoverReady, setPopoverReady] = useState(false);
	const foundElementRef = useRef<HTMLElement | undefined>(undefined);

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
			return;
		}

		pollByInterval(
			configStep.htmlElementId,
			configStep.id,
			!!configStep.highlight,
			tour.currentStepIndex,
			pollIntervalRef,
			setupListener,
			foundElementRef,
			previousStepHtmlElementId
		);
	};

	const resetTourActionListener = () => {
		cleanupAllHighlights();
		setPopoverVisible(false);
		setPopoverReady(false);
		processedStepsRef.current.clear();
		prevStepIndexRef.current = null;
		foundElementRef.current = undefined;
		pollIntervalRef.current = 0;
		removeTourOverlay();
	};

	const handlePopoverReady = () => {
		if (!activeStep) return;
		setPopoverReady(true);
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
			pollIntervalRef.current = 0;
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
		if (!popoverReady) return;

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

		if (currentStepIndex && currentStepIndex > 0 && previousStepHtmlElementId) {
			cleanupHighlight(undefined, previousStepHtmlElementId);
		}

		const cleanup = setupElementForStep(actionElement, htmlElementId, stepId, highlight);

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
			skipTour();
			resetTourActionListener();
			return;
		}

		const { isValid, currentTour, currentStep } = isStepValidForCurrentPath(activeTour, activeStep, pathname);
		if (!isValid || !currentTour || !currentStep) {
			resetTourActionListener();

			return;
		}

		if (prevStepIndexRef.current !== activeTour.currentStepIndex) {
			prevStepIndexRef.current = activeTour.currentStepIndex;
			foundElementRef.current = undefined;
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
			foundElementRef.current = actionElementRef.current;
			elementCleanupRef.current = listenerSetup.cleanup;
		} else {
			pollByInterval(
				currentStep.htmlElementId,
				currentStep.id,
				!!currentStep.highlight,
				activeTour.currentStepIndex,
				pollIntervalRef,
				setupListener,
				foundElementRef,
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

	useEffect(() => {
		if (!foundElementRef.current) {
			console.log("no found element");
			return;
		}
		if (!popoverReady) {
			console.log("no popover ready");
			setPopoverVisible(true);
			return;
		}
		console.log("configure popover");
		configurePopover(foundElementRef.current);
		createTourOverlay();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [foundElementRef.current, popoverReady]);
};
