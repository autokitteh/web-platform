export const gTagEvent = (eventName: string, eventParams: object) => {
	window.gtag("event", eventName, eventParams);
};
