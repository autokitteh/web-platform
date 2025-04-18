import { useEffect, useRef, useState } from "react";

import { useLocation, useParams } from "react-router-dom";

import { tours } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { TourStep, Tour, SetupListenerParams, SetupListenerResult } from "@src/interfaces/store";
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
	const { nextStep, activeTour, tourProjectId, activeStep, setPopoverVisible, skipTour, lastStepIndex } =
		useTourStore();
	const { pathname } = useLocation();
	const processedStepsRef = useRef<Set<string>>(new Set());
	const pollIntervalRef = useRef<number>(0);
	const [popoverReady, setPopoverReady] = useState(false);
	const foundElementRef = useRef<HTMLElement>(undefined);
	const [elementFound, setElementFound] = useState(false);
	const elementCleanupRef = useRef<() => void>(undefined);
	const { state } = useLocation();

	const handleStepCompletion = (event: MouseEvent) => {
		event.preventDefault();

		if (!activeStep) return;
		processedStepsRef.current.add(activeStep.id);
		nextStep(pathname);
	};

	const handleElementFound = ({ element, cleanup }: { cleanup?: () => void; element: HTMLElement }) => {
		highlightElement(element, element.id, true);
		elementCleanupRef.current = cleanup;
		foundElementRef.current = element;
		setElementFound(true);
		setPopoverVisible(true);
		removeTourOverlay();
		createTourOverlay();
	};

	const updateProcessedStepsForNavigation = () => {
		if (!activeStep) return;

		if (lastStepIndex !== undefined && activeTour.currentStepIndex < lastStepIndex) {
			processedStepsRef.current.delete(activeStep.id);
		}
	};

	const searchElementByTourStep = (event: CustomEvent<{ stepId: string; tourData: Tour; tourId: string }>) => {
		removeTourOverlay();
		const { stepId, tourId } = event.detail;

		const { configStep, currentTour } = resolveTourStep(tourId, stepId);
		if (!configStep || !currentTour) return;

		const previousStepHtmlElementId =
			activeTour.currentStepIndex > 0
				? currentTour.steps[activeTour.currentStepIndex - 1]?.htmlElementId
				: undefined;

		if (processedStepsRef.current.size > 0 && Array.from(processedStepsRef.current).pop() === configStep.id) {
			processedStepsRef.current.delete(configStep.id);
		}

		const listenerSetup = setupListener({
			targetElementId: configStep.htmlElementId,
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
		foundElementRef.current = undefined;
		setElementFound(false);
		elementCleanupRef.current = undefined;
		removeTourOverlay();
	};

	const handlePopoverReady = () => {
		if (!activeStep) return;
		setPopoverReady(true);
	};

	useEventListener(EventListenerName.tourPopoverReady, handlePopoverReady);
	useEventListener(EventListenerName.clearTourStepListener, resetTourActionListener);
	useEventListener(EventListenerName.searchElementByTourStep, searchElementByTourStep);
	useEventListener(
		EventListenerName.tourElementFound,
		(event: CustomEvent<{ cleanup?: () => void; element: HTMLElement }>) => {
			handleElementFound(event.detail);
		}
	);

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
		const cleanupListener = () => {
			actionElement.removeEventListener("click", handleStepCompletion);
		};

		cleanupListener();

		actionElement.addEventListener("click", handleStepCompletion);

		const highlightCleanup = highlightElement(actionElement, htmlElementId, !!highlight);
		foundElementRef.current = actionElement;
		setElementFound(true);

		return () => {
			cleanupListener();
			if (highlightCleanup) highlightCleanup();
		};
	};

	const configurePopover = (actionElement: HTMLElement) => {
		if (!popoverReady) return;
		triggerEvent(EventListenerName.configTourPopoverRef, actionElement);
	};

	const setupListener = ({
		targetElementId,
		shouldHighlight,
		stepIndex,
		previousElementId,
	}: SetupListenerParams): SetupListenerResult | undefined => {
		updateProcessedStepsForNavigation();

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

		if (lastStepIndex !== activeTour.currentStepIndex) {
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

			if (foundElementRef.current) {
				foundElementRef.current.removeEventListener("click", handleStepCompletion);
			}

			cleanupStepResources();

			if (elementCleanupRef.current) {
				elementCleanupRef.current();
				elementCleanupRef.current = undefined;
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
		if (!activeStep?.id || !activeTour?.tourId || !state?.startAbandonedTour) return;
		const tourData = tours[activeTour.tourId];
		triggerEvent(EventListenerName.searchElementByTourStep, {
			stepId: activeStep.id,
			tourId: activeTour.tourId,
			tourData,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state]);

	useEffect(() => {
		const handleBrowserBack = (event: PopStateEvent) => {
			if (activeTour?.tourId && activeStep && activeTour.currentStepIndex >= 0) {
				event.preventDefault();

				setTimeout(() => {
					const currentState = useTourStore.getState();
					if (currentState.activeTour?.tourId) {
						const { prevStep } = useTourStore.getState();

						window.history.pushState(window.history.state, document.title, window.location.href);
						prevStep();
					}
				}, 0);
			}
		};

		window.addEventListener("popstate", handleBrowserBack);

		return () => {
			window.removeEventListener("popstate", handleBrowserBack);
		};
	}, [activeTour, activeStep]);
};
