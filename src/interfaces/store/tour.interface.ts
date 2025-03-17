export interface TourStep {
	id: string;
	targetElementId: string;
	title: string;
	content: React.ReactNode | string;
	placement?: "top" | "bottom" | "left" | "right";
	highlight?: boolean;
}

export interface Tour {
	id: string;
	name: string;
	steps: TourStep[];
}

export interface TourStore {
	activeTourId: string | null;
	activeStepIndex: number;
	completedTours: string[];
	pausedTours: Record<string, number | undefined>;

	startTour: (tourId: string) => void;
	nextStep: (totalSteps: number) => void;
	prevStep: () => void;
	skipTour: () => void;
	pauseTour: () => void;
	hasTourBeenCompleted: (tourId: string) => boolean;
	resetTours: () => void;
}
