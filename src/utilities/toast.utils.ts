export const getCloseToastTestId = (message: string): string =>
	`close-${message.toLowerCase().replace(/ /g, "-")}-toast`;
