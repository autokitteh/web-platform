import { useEffect, useRef } from "react";

import { EventListenerName } from "@enums";
import { EventData } from "@type/hooks";

const eventListenersMap = new Map<string, Set<EventListener>>();

export const useEventListener = <T extends EventListenerName>(
	eventName: T,
	handler: (event: CustomEvent<EventData<T>>) => void
) => {
	const handlerRef = useRef<EventListener>();

	handlerRef.current = handler as EventListener;

	useEffect(() => {
		const eventListener = (event: Event) => {
			handlerRef.current?.(event);
		};

		if (!eventListenersMap.has(eventName)) {
			eventListenersMap.set(eventName, new Set());
		}

		const listeners = eventListenersMap.get(eventName)!;

		if (!listeners.has(eventListener)) {
			listeners.add(eventListener);

			window.addEventListener(eventName, eventListener);
		}

		return () => {
			const listeners = eventListenersMap.get(eventName);
			if (listeners?.has(eventListener)) {
				window.removeEventListener(eventName, eventListener);
				listeners.delete(eventListener);

				if (listeners.size === 0) {
					eventListenersMap.delete(eventName);
				}
			}
		};
	}, [eventName]);
};

export const triggerEvent = <T extends EventListenerName>(eventName: T, detail?: EventData<T>) => {
	const event = new CustomEvent(eventName, { detail });
	window.dispatchEvent(event);
};
