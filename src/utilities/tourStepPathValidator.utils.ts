export const shouldShowStepOnPath = (step: { pathPatterns?: (string | RegExp)[] }, currentPath: string): boolean => {
	if (!step.pathPatterns) return true;

	return step.pathPatterns.some((pattern: string | RegExp) => {
		if (typeof pattern === "string") {
			return currentPath === pattern || currentPath.startsWith(pattern);
		} else if (pattern instanceof RegExp) {
			return pattern.test(currentPath);
		}
		return false;
	});
};
