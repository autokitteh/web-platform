import { ReactNode } from "react";

import { Placement } from "@floating-ui/react";

import { TourId } from "@src/enums";

export interface TourStep {
	id: string;
	title: string | ReactNode;
	content?: string | ReactNode;
	renderContent?: () => ReactNode;
	placement?: Placement;
	highlight?: boolean;
	displayNext?: boolean;
	hideBack?: boolean;
	pathPatterns?: Array<string | RegExp>;
}

export interface Tour {
	id: TourId;
	steps: TourStep[];
	assetDirectory?: string;
	defaultFile: string;
	description: string;
	entrypointFunction: string;
	entrypointFile: string;
	name: string;
}

export interface TourProgress {
	tourId: string;
	currentStepIndex: number;
}

export interface TourStore {
	activeTour: TourProgress | null;
	completedTours: string[];

	startTour: (tourId: string) => Promise<{ defaultFile: string; projectId: string } | undefined>;
	nextStep: () => void;
	prevStep: () => void;
	skipTour: () => void;
	hasTourBeenCompleted: (tourId: string) => boolean;
	reset: () => void;
	fetchTours: () => Promise<void>;
}

export interface TutorialProgressModalProps {
	onStepSelect: (stepId: string) => void;
	isStarting: boolean;
}
