import { tourSteps } from "@src/constants";

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
