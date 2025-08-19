export const extractOriginalMessage = (formattedMessage: string): string => {
	const match = formattedMessage.match(/^\[.*?\] (.*)$/);
	return match ? match[1] : formattedMessage;
};
