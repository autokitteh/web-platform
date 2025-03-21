import { ReactNode } from "react";

export interface TourStep {
	id: string;
	targetElementId: string;
	title: string | ReactNode;
	content?: string | ReactNode;
	renderContent?: () => ReactNode;
	placement?: "top" | "bottom" | "left" | "right";
	highlight?: boolean;
	actionElementId: string;
	displayNext?: boolean;
}

export interface Tour {
	id: string;
	name: string;
	navigateOnComplete?: string;
	steps: TourStep[];
}

export interface TourProgress {
	tourId: string;
	currentStepIndex: number;
}

export interface TourStore {
	activeTour: TourProgress | null;
	completedTours: string[];

	startTour: (tourId: string) => void;
	nextStep: () => void;
	prevStep: () => void;
	skipTour: () => void;
	hasTourBeenCompleted: (tourId: string) => boolean;
	resetTours: () => void;
}
