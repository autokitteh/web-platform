export const gTagEvent = (eventName: string, eventParams: object) => {
	if (window.gtag) window.gtag("event", eventName, eventParams);
};
