export const formatNumberWithEllipsis = (num: number): string => {
	const numStr = num.toString();

	if (numStr.length <= 5) {
		return num.toLocaleString("en-US");
	}

	return `${parseInt(numStr.substring(0, 5)).toLocaleString("en-US")}...`;
};
