export const getTestIdFromText = (prefix: string, message: string): string =>
	`${prefix}-${message.toLowerCase().replace(/ /g, "-")}`;
