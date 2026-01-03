import { RefObject, useEffect } from "react";

type EventMap = HTMLElementEventMap & WindowEventMap & DocumentEventMap;
type EventType = keyof EventMap;
type EventHandler<T extends EventType> = (event: EventMap[T]) => void;

export const useEventSubscription = <T extends EventType, E extends HTMLElement | Window | Document | null>(
	elementRef: RefObject<E> | E,
	eventType: T,
	handler: EventHandler<T>
) => {
	useEffect(() => {
		const element = elementRef && "current" in elementRef ? elementRef.current : elementRef;

		if (!element) return;

		// @ts-expect-error - EventMap is not perfectly compatible with addEventListener
		element.addEventListener(eventType, handler);

		return () => {
			// @ts-expect-error - EventMap is not perfectly compatible with removeEventListener
			element.removeEventListener(eventType, handler);
		};
	}, [elementRef, eventType, handler]);
};
