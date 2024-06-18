import { useEffect, useRef } from "react";

type Callback = () => void;

export const useInterval = (callback: Callback, delay: number): (() => void) => {
	const callbackRef = useRef<Callback>();
	const intervalRef = useRef<number | null>(null);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		function tick() {
			if (callbackRef.current) {
				callbackRef.current();
			}
		}

		intervalRef.current = window.setInterval(tick, delay);
		return () => clearInterval(intervalRef.current as number);
	}, [delay]);

	const clear = () => {
		if (!intervalRef.current) return;

		clearInterval(intervalRef.current as number);
		intervalRef.current = null;
	};

	return clear;
};
