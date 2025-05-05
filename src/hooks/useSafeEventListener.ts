import { useRef, useEffect, RefObject } from "react";

type EventMap = HTMLElementEventMap & WindowEventMap & DocumentEventMap;
type EventType = keyof EventMap;
type EventHandler<T extends EventType> = (event: EventMap[T]) => void;

export const useSafeEventListener = <T extends EventType, E extends HTMLElement | Window | Document | null>(
	elementRef: RefObject<E> | E,
	eventType: T,
	handler: EventHandler<T>,
	options?: boolean | AddEventListenerOptions
) => {
	const handlerRef = useRef<EventHandler<T>>(handler);
	const listenerAttachedRef = useRef(false);

	useEffect(() => {
		handlerRef.current = handler;
	}, [handler]);

	useEffect(() => {
		const element = (elementRef as RefObject<E>)?.current || (elementRef as E);

		if (!element || listenerAttachedRef.current) return;

		const eventListener: EventListener = (event) => {
			handlerRef.current(event as EventMap[T]);
		};

		element.addEventListener(eventType, eventListener, options);
		listenerAttachedRef.current = true;

		return () => {
			element.removeEventListener(eventType, eventListener, options);
			listenerAttachedRef.current = false;
		};
	}, [elementRef, eventType, options]);
};
