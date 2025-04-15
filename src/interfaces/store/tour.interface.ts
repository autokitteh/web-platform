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
	tourId: string;
	currentStepIndex: number;
}

export interface TourStore {
	activeTour: TourProgress;
	activeStep?: TourStep;
	lastStepUrl?: string;
	completedTours: string[];
	canceledTours: string[];

	isPopoverVisible: boolean;
	setPopoverVisible: (visible: boolean) => void;
	setLastStepUrl: (url: string) => void;

	startTour: (TourId: string) => Promise<{ defaultFile: string; projectId: string } | undefined>;
	nextStep: () => void;
	prevStep: () => void;
	skipTour: () => void;
	reset: () => void;
	fetchTours: () => Promise<void>;
}

export interface TutorialProgressModalProps {
	onStepSelect: (stepId: string) => void;
	isStarting: boolean;
}
