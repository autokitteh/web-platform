import { useEffect } from "react";

import { EventListenerName } from "@src/enums";

export const useEventListener = <T = any>(eventName: EventListenerName, handler: (data: T) => void) => {
	useEffect(() => {
		const eventHandler = (event: CustomEvent<T>) => {
			handler(event.detail);
		};

		window.addEventListener(eventName, eventHandler as EventListener);
		return () => window.removeEventListener(eventName, eventHandler as EventListener);
	}, [eventName, handler]);
};

export const triggerEvent = <T = any>(eventName: EventListenerName, data?: T) => {
	const event = new CustomEvent(eventName, { detail: data });
	window.dispatchEvent(event);
};
