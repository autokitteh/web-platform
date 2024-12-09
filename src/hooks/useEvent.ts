import { type Dispatch, useCallback, useEffect } from "react";

interface AppEvent<PayloadType = unknown> extends Event {
	detail: PayloadType;
}

export interface CustomWindowEventMap extends WindowEventMap {
	onConnectionLoaded: AppEvent<boolean>;
}

export const useEvent = <PayloadType = unknown>(
	eventName: keyof CustomWindowEventMap,
	callback?: Dispatch<PayloadType> | VoidFunction
) => {
	const listener = useCallback(
		((event: AppEvent<PayloadType>) => {
			callback?.(event.detail);
		}) as EventListener,
		[callback]
	);

	useEffect(() => {
		if (!callback) {
			return;
		}

		window.addEventListener(eventName, listener);

		return () => window.removeEventListener(eventName, listener);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventName, listener]);

	const dispatch = useCallback(
		(detail: PayloadType) => {
			window.dispatchEvent(new CustomEvent(eventName, { detail }));
		},
		[eventName]
	);

	return { dispatch };
};
