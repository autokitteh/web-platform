import { useCallback, useRef } from "react";

type Callback = () => void;

export const useInterval = (): {
	startInterval: (name: string, callback: Callback, delay: number) => void;
	stopInterval: (name: string) => void;
} => {
	const callbackRefs = useRef<{ [key: string]: Callback }>({});
	const intervalRefs = useRef<{ [key: string]: number }>({});

	const stopInterval = useCallback((name: string) => {
		if (intervalRefs.current[name]) {
			clearInterval(intervalRefs.current[name]);
			delete intervalRefs.current[name];
			delete callbackRefs.current[name];
		}
	}, []);

	const startInterval = useCallback((name: string, callback: Callback, delay: number) => {
		stopInterval(name);

		callbackRefs.current[name] = callback;
		intervalRefs.current[name] = window.setInterval(() => {
			callbackRefs.current[name]?.();
		}, delay);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		startInterval,
		stopInterval,
	};
};
