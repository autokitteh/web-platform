import { tours } from "@src/constants";
import { TourStepInfo } from "@src/interfaces/hooks/useTourStepStatus.interface";
import { useTourStore } from "@src/store/useTourStore";

export const useTourStep = (): TourStepInfo => {
	const { activeTour } = useTourStore();

	if (!activeTour) {
		return {
			currentTour: null,
			currentStep: null,
			isFirstStep: false,
			isLastStep: false,
		};
	}

	const currentTour = tours[activeTour.tourId];
	if (!currentTour) {
		return {
			currentTour: null,
			currentStep: null,
			isFirstStep: false,
			isLastStep: false,
		};
	}

	const currentStep = currentTour.steps[activeTour.currentStepIndex];
	const isFirstStep = activeTour.currentStepIndex === 0;
	const isLastStep = activeTour.currentStepIndex === currentTour.steps.length - 1;

	return {
		currentTour,
		currentStep,
		isFirstStep,
		isLastStep,
	};
};
