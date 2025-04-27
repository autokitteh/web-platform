import { tours, tourSteps } from "@constants";
import { Tour, TourStep } from "@interfaces/store";

export const verifyTourStepIdsUniqueness = () => {
	if (process.env.NODE_ENV !== "production") {
		const allIds = new Set<string>();
		const duplicates: string[] = [];

		Object.values(tourSteps).forEach((tourType) => {
			Object.values(tourType).forEach((id) => {
				if (allIds.has(id)) {
					duplicates.push(id);
				} else {
					allIds.add(id);
				}
			});
		});

		if (duplicates.length > 0) {
			throw new Error(`[Tour] Found duplicate step IDs: ${duplicates.join(", ")}`);
		}
	}
};

export const resolveTourStep = (
	tourId: string,
	stepId: string
): { configStep: TourStep | null; currentTour: Tour | null } => {
	if (!tourId || !stepId) return { currentTour: null, configStep: null };

	const currentTour = tours[tourId];
	if (!currentTour) return { currentTour: null, configStep: null };

	const configStep = currentTour.steps.find((s) => s.id === stepId);
	return { currentTour, configStep: configStep || null };
};
