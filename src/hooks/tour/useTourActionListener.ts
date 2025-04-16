import { useEffect, useRef, useState, useCallback } from "react";

import { useLocation, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { TourStep, Tour, SetupListenerParams, SetupListenerResult } from "@src/interfaces/store/tour.interface";
import {
	shouldShowStepOnPath,
	cleanupHighlight,
	highlightElement,
	createTourOverlay,
	cleanupAllHighlights,
	removeTourOverlay,
	pollByInterval,
	resolveTourStep,
} from "@src/utilities";

import { triggerEvent, useEventListener } from "@hooks";
import { useTourStore } from "@store";

export const useTourActionListener = () => {
	const { projectId: projectIdFromURL } = useParams();
	const { nextStep, activeTour, tourProjectId, activeStep, setPopoverVisible, setLastStepUrl, skipTour } =
		useTourStore();
	const { pathname, state } = useLocation();
	const prevStepIndexRef = useRef<number | null>(null);
	const processedStepsRef = useRef<Set<string>>(new Set());
	const pollIntervalRef = useRef<number>(0);
	const [popoverReady, setPopoverReady] = useState(false);
	const foundElementRef = useRef<HTMLElement | undefined>(undefined);
	const [elementFound, setElementFound] = useState(false);

	const elementCleanupRef = useRef<(() => void) | undefined>(undefined);

	const handleStepCompletion = useCallback(() => {
		if (!activeStep) return;
		processedStepsRef.current.add(activeStep.id);
		nextStep();
	}, [nextStep, activeStep]);

	const handleElementFound = ({ element, cleanup }: { cleanup?: () => void; element: HTMLElement }) => {
		highlightElement(element, element.id, true);
		elementCleanupRef.current = cleanup;
		foundElementRef.current = element;
		setElementFound(true);
		setPopoverVisible(true);
		removeTourOverlay();
		createTourOverlay();
		setLastStepUrl(pathname);
	};

	const searchElementByTourStep = (event: CustomEvent<{ stepId: string; tourData: Tour; tourId: string }>) => {
		const { stepId, tourId } = event.detail;

		const { configStep, currentTour } = resolveTourStep(tourId, stepId);
		if (!configStep || !currentTour) return;

		const previousStepHtmlElementId =
			activeTour.currentStepIndex > 0
				? currentTour.steps[activeTour.currentStepIndex - 1]?.htmlElementId
				: undefined;

		const listenerSetup = setupListener({
			targetElementId: configStep.htmlElementId,
			tourStepId: configStep.id,
			shouldHighlight: !!configStep.highlight,
			stepIndex: activeTour.currentStepIndex,
			previousElementId: previousStepHtmlElementId,
		});

		if (listenerSetup) {
			handleElementFound(listenerSetup);
			return;
		}

		pollByInterval(
			configStep.htmlElementId,
			configStep.id,
			!!configStep.highlight,
			activeTour.currentStepIndex,
			pollIntervalRef,
			setupListener,
			foundElementRef,
			previousStepHtmlElementId
		);
	};

	const hideTour = () => {
		cleanupAllHighlights();
		setPopoverVisible(false);
		setPopoverReady(false);
		foundElementRef.current = undefined;
		setElementFound(false);
		removeTourOverlay();
	};

	const resetTourActionListener = () => {
		cleanupAllHighlights();
		setPopoverVisible(false);
		setPopoverReady(false);
		processedStepsRef.current.clear();
		prevStepIndexRef.current = null;
		foundElementRef.current = undefined;
		setElementFound(false);
		elementCleanupRef.current = undefined;
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
	const searchElementByTourStepListener = useEventListener(
		EventListenerName.searchElementByTourStep,
		searchElementByTourStep
	);

	const setupElementFoundListener = useEventListener(
		EventListenerName.tourElementFound,
		(event: CustomEvent<{ cleanup?: () => void; element: HTMLElement }>) => {
			handleElementFound(event.detail);
		}
	);

	useEffect(() => {
		const cleanupPopoverReadyListener = setupPopoverReadyListener;
		const cleanupClearTourStepListener = setupClearTourStepListener;
		const cleanupTourStepListener = searchElementByTourStepListener;
		const cleanupElementFoundListener = setupElementFoundListener;
		return () => {
			cleanupPopoverReadyListener;
			cleanupClearTourStepListener;
			cleanupTourStepListener;
			cleanupElementFoundListener;
		};
	}, [
		setupPopoverReadyListener,
		setupClearTourStepListener,
		searchElementByTourStepListener,
		setupElementFoundListener,
	]);

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
		highlight?: boolean
	): (() => void) | undefined => {
		actionElement.addEventListener("click", handleStepCompletion);
		const cleanup = highlightElement(actionElement, htmlElementId, !!highlight);
		foundElementRef.current = actionElement;
		setElementFound(true);
		return cleanup;
	};

	const configurePopover = (actionElement: HTMLElement) => {
		if (!popoverReady) return;
		triggerEvent(EventListenerName.configTourPopoverRef, actionElement);
	};

	const setupListener = ({
		targetElementId,
		tourStepId,
		shouldHighlight,
		stepIndex,
		previousElementId,
	}: SetupListenerParams): SetupListenerResult | undefined => {
		if (processedStepsRef.current.has(tourStepId)) return;

		const actionElement = getActionElement(targetElementId);
		if (!actionElement) return;

		if (stepIndex && stepIndex > 0 && previousElementId) {
			cleanupHighlight(undefined, previousElementId);
		}

		const cleanup = setupElementForStep(actionElement, targetElementId, shouldHighlight);

		return { element: actionElement, cleanup };
	};

	const isStepValidForCurrentPath = (
		pathname: string
	): {
		currentStep: TourStep | null;
		currentTour: Tour | null;
		isValid: boolean;
	} => {
		const isTourProject = projectIdFromURL === tourProjectId;
		if (!isTourProject) return { isValid: false, currentTour: null, currentStep: null };

		const stepId = activeStep?.id;
		if (!stepId) return { isValid: false, currentTour: null, currentStep: null };

		const { currentTour, configStep } = resolveTourStep(activeTour.tourId, activeStep.id);

		if (!currentTour || !configStep) return { isValid: false, currentTour: null, currentStep: null };

		const isStepApplicableToCurrentPath = shouldShowStepOnPath(configStep, pathname);

		if (!isStepApplicableToCurrentPath) {
			return { isValid: false, currentTour: null, currentStep: null };
		}

		return { isValid: true, currentTour, currentStep: configStep };
	};

	useEffect(() => {
		if (!activeTour?.tourId || !activeStep?.id) {
			skipTour();
			resetTourActionListener();
			return;
		}

		const { currentTour, currentStep, isValid } = isStepValidForCurrentPath(pathname);

		if (!currentTour || !currentStep || !isValid) return;

		if (prevStepIndexRef.current !== activeTour.currentStepIndex) {
			prevStepIndexRef.current = activeTour.currentStepIndex;
			foundElementRef.current = undefined;
			setElementFound(false);
			pollIntervalRef.current = 0;
		}

		cleanupAllHighlights();
		cleanupStepResources();

		triggerEvent(EventListenerName.searchElementByTourStep, {
			stepId: currentStep.id,
			tourId: currentTour.id,
			tourData: currentTour,
		});

		return () => {
			if (!activeTour || !activeStep) return;

			const { currentTour } = resolveTourStep(activeTour.tourId, activeStep.id);
			if (!currentTour) return;

			const currentActiveStepIndex = currentTour.steps.findIndex((step) => step.id === activeStep.id);
			if (currentActiveStepIndex === activeTour.currentStepIndex) return;

			if (foundElementRef.current) {
				foundElementRef.current.removeEventListener("click", handleStepCompletion);
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
		if (!isStepValidForCurrentPath(pathname)?.isValid) {
			hideTour();
			return;
		}

		if (!elementFound || !foundElementRef.current) {
			return;
		}

		setElementFound(false);
		configurePopover(foundElementRef.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [elementFound, popoverReady, pathname]);

	useEffect(() => {
		if (!state?.restartTourParams) return;

		const resetState = () => window.history.replaceState({ ...state, restartTourParams: undefined }, "", pathname);
		const { tourId, stepId } = state.restartTourParams;
		const { configStep, currentTour } = resolveTourStep(tourId, stepId);
		if (!configStep || !currentTour) return;

		if (configStep.pathPatterns.some((pattern) => pattern.test(pathname))) {
			triggerEvent(EventListenerName.searchElementByTourStep, {
				stepId: configStep.id,
				tourData: currentTour,
				tourId: currentTour.id,
			});
			setTimeout(resetState, 0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);
};
