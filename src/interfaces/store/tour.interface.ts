import { Placement } from "@floating-ui/react";

import { TourId } from "@enums";
import { StoreResponse } from "@src/types/stores";

export interface TourStep {
	htmlElementId: string;
	id: string;
	title: string;
	content?: string;
	renderContent?: () => JSX.Element;
	placement: Placement;
	highlight?: boolean;
	displayNext?: boolean;
	hideBack?: boolean;
	popoverDelayMs?: number;
	pathPatterns: RegExp[];
	overlayAboveDrawer?: boolean;
	actionButton?: {
		ariaLabel?: string;
		execute: () => void;
		label: string;
	};
}

export interface Tour {
	id: TourId;
	name: string;
	description: string;
	assetDirectory: string;
	defaultFile: string;
	entrypointFunction: string;
	entrypointFile: string;
	steps: TourStep[];
}

export interface TourProgress {
	tourId: TourId;
	currentStepIndex: number;
}

export interface TourStore {
	activeTour: TourProgress;
	activeStep?: TourStep;
	lastStepUrls: string[];
	lastStepIndex?: number;
	completedTours: string[];
	canceledTours: string[];
	tourProjectId?: string;
	isPopoverVisible: boolean;
	isToursReady: boolean;
	tours: Record<string, Tour>;
	getLastStepUrl: () => string | undefined;
	setPopoverVisible: (visible: boolean) => void;
	setToursReady: (tours: Record<string, Tour>) => void;
	endTour: (action: "skip" | "complete") => void;
	startTour: (TourId: TourId) => Promise<StoreResponse<{ defaultFile: string; projectId: string }>>;
	nextStep: (currentStepUrl: string) => void;
	prevStep: () => void;
	skipTour: () => void;
	reset: () => void;
	isOnActiveTourPage: (tourId: TourId, projectId: string) => boolean;
}

export interface TutorialProgressModalProps {
	onStepStart: (stepId: TourId) => void;
	isStarting: Record<TourId, boolean>;
}

export interface SetupListenerResult {
	cleanup?: () => void;
	element: HTMLElement;
}

export interface SetupListenerParams {
	targetElementId: string;
	shouldHighlight?: boolean;
	stepIndex?: number;
	previousElementId?: string;
}
