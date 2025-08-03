import { useEffect, useRef } from "react";

import { EventListenerName } from "@src/enums";
import { EventData } from "@src/types/hooks";

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
	const registeredListeners = eventListenersMap.get(eventName)?.size || 0;

	if (registeredListeners === 0) {
		setTimeout(() => {
			const retryListeners = eventListenersMap.get(eventName)?.size || 0;
			if (retryListeners > 0) {
				const event = new CustomEvent(eventName, { detail });
				window.dispatchEvent(event);
			} else {
				const event = new CustomEvent(eventName, { detail });
				window.dispatchEvent(event);
			}
		}, 50);
	} else {
		const event = new CustomEvent(eventName, { detail });
		window.dispatchEvent(event);
	}
};
