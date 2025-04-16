import { Placement } from "@floating-ui/react";

import { TourId } from "@enums";

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
	pathPatterns: RegExp[];
	customComponentProps?: Record<string, any>;
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
	lastStepUrl?: string;
	prevStepUrl?: string;
	completedTours: string[];
	canceledTours: string[];
	tourProjectId?: string;
	isPopoverVisible: boolean;
	setPopoverVisible: (visible: boolean) => void;
	setLastStepUrl: (url: string) => void;
	setPrevStepUrl: (url: string) => void;
	endTour: (action: "skip" | "complete") => void;
	startTour: (TourId: TourId) => Promise<{ defaultFile: string; projectId: string } | undefined>;
	nextStep: () => void;
	prevStep: () => void;
	skipTour: () => void;
	reset: () => void;
	fetchTours: () => Promise<void>;
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
	tourStepId: string;
	shouldHighlight?: boolean;
	stepIndex?: number;
	previousElementId?: string;
}
