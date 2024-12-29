export const gTagEvent = (eventName: string, eventProps: object) => {
	window.gtag("event", eventName, eventProps);
};
