export const formatCompactNumber = (num: number): string => {
	return new Intl.NumberFormat("en-US", {
		notation: "compact",
		maximumFractionDigits: 2,
	}).format(num);
};
