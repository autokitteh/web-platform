import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import { TourId } from "@src/enums";

import { useTourStore } from "@store";

export const useTourStart = () => {
	const { startTour, hasTourBeenCompleted } = useTourStore();
	const location = useLocation();
	const { tourId } = location.state || {};

	useEffect(() => {
		if (!tourId) return;

		if (Object.values(TourId).includes(tourId) && !hasTourBeenCompleted(tourId)) {
			const timeoutId = setTimeout(() => {
				startTour(tourId);
			}, 500);

			return () => clearTimeout(timeoutId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tourId]);

	return null;
};
