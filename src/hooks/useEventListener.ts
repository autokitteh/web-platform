import { useEffect } from "react";

import { EventListenerName } from "@src/enums";
import { EventData } from "@src/types/hooks";

export const useEventListener = <T extends EventListenerName>(
	eventName: T,
	handler: (event: CustomEvent<EventData<T>>) => void
) => {
	useEffect(() => {
		window.addEventListener(eventName, handler as EventListener);
		return () => window.removeEventListener(eventName, handler as EventListener);
	}, [eventName, handler]);
};

export const triggerEvent = <T extends EventListenerName>(eventName: T, detail?: EventData<T>) => {
	const event = new CustomEvent(eventName, { detail });
	window.dispatchEvent(event);
};
