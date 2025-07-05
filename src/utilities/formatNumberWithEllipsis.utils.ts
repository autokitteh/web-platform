export const formatNumberWithEllipsis = (num: number): string => {
	const numStr = num.toString();

	if (numStr.length <= 3) {
		return numStr;
	}

	return `${numStr.substring(0, 3)}...`;
};
