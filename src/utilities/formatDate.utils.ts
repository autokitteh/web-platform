export const formatDate = (date?: Date | string): string => {
	if (!date) return "N/A";
	return new Date(date).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export const formatDateShort = (date?: Date | string): string => {
	if (!date) return "N/A";
	return new Date(date).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
	});
};
