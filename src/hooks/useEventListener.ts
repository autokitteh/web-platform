import { useEffect } from "react";

import { EventListenerName } from "@src/enums";

export const useEventListener = (eventName: EventListenerName, handler: () => void) => {
	useEffect(() => {
		const eventHandler = () => {
			handler();
		};

		window.addEventListener(eventName, eventHandler as EventListener);

		return () => window.removeEventListener(eventName, eventHandler as EventListener);
	}, [eventName, handler]);
};

export const triggerEvent = (eventName: EventListenerName) => {
	const event = new CustomEvent(eventName);
	window.dispatchEvent(event);
};
