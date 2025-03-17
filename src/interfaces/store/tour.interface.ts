export interface TourProgress {
	tourId: string;
	currentStepIndex: number;
}

export interface TourStep {
	id: string;
	targetElementId: string;
	title: string;
	content: React.ReactNode | string;
	placement?: "top" | "bottom" | "left" | "right";
	highlight?: boolean;
	actionElementId: string;
}

export interface Tour {
	id: string;
	name: string;
	steps: TourStep[];
}

export interface TourStore {
	activeTour: TourProgress | null;
	completedTours: string[];
	pausedTours: Record<string, number | undefined>;

	startTour: (tourId: string) => void;
	nextStep: () => void;
	prevStep: () => void;
	skipTour: () => void;
	pauseTour: () => void;
	hasTourBeenCompleted: (tourId: string) => boolean;
	resetTours: () => void;
}
