import { useEffect, useRef } from "react";

import { EventListenerName } from "@src/enums";
import { EventData } from "@src/types/hooks";

const eventListenersMap = new Map<string, Set<EventListener>>();

export const useEventListener = <T extends EventListenerName>(
	eventName: T,
	handler: (event: CustomEvent<EventData<T>>) => void
) => {
	const handlerRef = useRef<EventListener>();

	// Store the latest handler in a ref
	handlerRef.current = handler as EventListener;

	useEffect(() => {
		// Create a stable reference to the handler
		const eventListener = (event: Event) => {
			handlerRef.current?.(event);
		};

		// Track this listener
		if (!eventListenersMap.has(eventName)) {
			eventListenersMap.set(eventName, new Set());
		}

		const listeners = eventListenersMap.get(eventName)!;

		// Only add if not already tracked
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
	}, [eventName]); // Only depend on eventName, not handler
};

export const triggerEvent = <T extends EventListenerName>(eventName: T, detail?: EventData<T>) => {
	const event = new CustomEvent(eventName, { detail });
	window.dispatchEvent(event);
};
