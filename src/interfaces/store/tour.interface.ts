import { Placement } from "@floating-ui/react";

import { TourId } from "@enums";
import { TourStepKeys, TourStepValues } from "@type";

export interface TourStep<T extends TourStepKeys = TourStepKeys> {
	htmlElementId: string;
	id: TourStepValues<T>;
	title: string;
	content?: string;
	renderContent?: () => JSX.Element;
	placement: Placement;
	highlight?: boolean;
	displayNext?: boolean;
	hideBack?: boolean;
	pathPatterns: RegExp[];
}

export interface Tour<T extends TourStepKeys = TourStepKeys> {
	id: TourId;
	name: string;
	description: string;
	assetDirectory: string;
	defaultFile: string;
	entrypointFunction: string;
	entrypointFile: string;
	steps: TourStep<T>[];
}

export interface TourProgress {
	tourId: string;
	currentStepIndex: number;
}

export interface TourStore {
	activeTour: TourProgress;
	activeStep?: TourStep;
	completedTours: string[];

	isPopoverVisible: boolean;
	setPopoverVisible: (visible: boolean) => void;

	startTour: (TourId: string) => Promise<{ defaultFile: string; projectId: string } | undefined>;
	nextStep: () => void;
	prevStep: () => void;
	skipTour: () => void;
	isTourCompleted: (tourId: TourId) => boolean;
	reset: () => void;
	fetchTours: () => Promise<void>;
}

export interface TutorialProgressModalProps {
	onStepSelect: (stepId: string) => void;
	isStarting: boolean;
}
