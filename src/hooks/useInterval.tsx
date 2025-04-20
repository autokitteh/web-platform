import { useCallback, useRef } from "react";

import { IntervalCallback, IntervalKey } from "@src/types/utilities";

export const useInterval = (): {
	startInterval: (name: IntervalKey, callback: IntervalCallback, delay: number) => void;
	stopInterval: (name: IntervalKey) => void;
} => {
	const callbackRefs = useRef<{ [key: string]: IntervalCallback }>({});
	const intervalRefs = useRef<{ [key: string]: number }>({});

	const stopInterval = useCallback((name: IntervalKey) => {
		if (intervalRefs.current[name]) {
			clearInterval(intervalRefs.current[name]);
			delete intervalRefs.current[name];
			delete callbackRefs.current[name];
		}
	}, []);

	const startInterval = useCallback((name: IntervalKey, callback: IntervalCallback, delay: number) => {
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
