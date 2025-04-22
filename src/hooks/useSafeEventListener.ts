import { useRef, useEffect, RefObject } from "react";

type EventMap = HTMLElementEventMap & WindowEventMap & DocumentEventMap;
type EventType<T> = keyof EventMap;
type EventHandler<T extends EventType<T>> = (event: EventMap[T]) => void;

/**
 * A custom hook that safely attaches DOM event listeners, preventing duplicates
 * and ensuring proper cleanup.
 *
 * @param elementRef - A React ref to the element to attach the listener to
 * @param eventType - The DOM event type (e.g., 'scroll', 'click', etc.)
 * @param handler - The event handler function
 * @param options - Standard AddEventListenerOptions
 */
export const useSafeEventListener = <T extends EventType<T>, E extends HTMLElement | Window | Document | null>(
	elementRef: RefObject<E> | E,
	eventType: T,
	handler: EventHandler<T>,
	options?: boolean | AddEventListenerOptions
) => {
	const handlerRef = useRef<EventHandler<T>>(handler);
	const listenerAttachedRef = useRef(false);

	// Update the handler ref if the handler changes
	useEffect(() => {
		handlerRef.current = handler;
	}, [handler]);

	useEffect(() => {
		// Get the actual element from the ref object or use the element directly
		const element = (elementRef as RefObject<E>)?.current || (elementRef as E);

		if (!element || listenerAttachedRef.current) return;

		// Define the event listener that calls the latest handler
		const eventListener: EventListener = (event) => {
			handlerRef.current(event as EventMap[T]);
		};

		// Attach event listener and mark as attached
		element.addEventListener(eventType, eventListener, options);
		listenerAttachedRef.current = true;

		// Cleanup function
		return () => {
			element.removeEventListener(eventType, eventListener, options);
			listenerAttachedRef.current = false;
		};
	}, [elementRef, eventType, options]);
};
