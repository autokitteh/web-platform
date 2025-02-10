export const gTagEvent = (eventName: string, eventParams: object) => {
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: eventName,
		eventParams,
	});
};
