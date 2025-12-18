import prettyMs from "pretty-ms";

export const formatNumber = (num: number): string =>
	new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(num);

export const formatDuration = (ms: number): string => prettyMs(ms);
