import { TourStep } from "@interfaces/store";

export const shouldShowStepOnPath = (tourStep: TourStep, currentPath: string): boolean => {
	if (!tourStep.pathPatterns) return false;

	return tourStep.pathPatterns.some((pattern: RegExp) => {
		if (typeof pattern === "string") {
			return currentPath === pattern || currentPath.startsWith(pattern);
		} else if (pattern instanceof RegExp) {
			return pattern.test(currentPath);
		}
		return false;
	});
};
