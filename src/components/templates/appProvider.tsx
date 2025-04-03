import React, { ReactNode } from "react";

import { useTourStore } from "@store/useTourStore";

import { Toast } from "@components/molecules";
import { ToursProgress } from "@components/molecules/toursProgress";
import { TourManager } from "@components/organisms";

interface AppProviderProps {
	children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
	const { completedTours, startTour } = useTourStore();

	return (
		<>
			{children}
			<Toast />
			<TourManager />
			<ToursProgress completedSteps={completedTours} onStepSelect={(tourId: string) => startTour(tourId)} />
		</>
	);
};
