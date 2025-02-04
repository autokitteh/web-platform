import { useEffect } from "react";

import { EventListenerName } from "@src/enums";

export const useEventListener = (eventName: EventListenerName, handler: () => void) => {
	useEffect(() => {
		window.addEventListener(eventName, handler as EventListener);
		return () => window.removeEventListener(eventName, handler as EventListener);
	}, [eventName, handler]);
};

export const triggerEvent = (eventName: EventListenerName) => {
	const event = new CustomEvent(eventName);
	window.dispatchEvent(event);
};
