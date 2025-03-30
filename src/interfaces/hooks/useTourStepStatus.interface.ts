import { Tour, TourStep } from "@src/interfaces/store";

export interface TourStepInfo {
	currentTour: Tour | null;
	currentStep: TourStep | null;
	isFirstStep: boolean;
	isLastStep: boolean;
}
