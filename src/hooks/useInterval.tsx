import { useRef, useState } from "react";

type Callback = () => void;

type Intervals = {
	[key: string]: number | null;
};

export const useInterval = (): {
	startInterval: (name: string, callback: Callback, delay: number) => void;
	stopInterval: (name: string) => void;
} => {
	const callbackRefs = useRef<{ [key: string]: Callback }>({});
	const [intervals, setIntervals] = useState<Intervals>({});

	const startInterval = (name: string, callback: Callback, delay: number) => {
		if (intervals[name]) {
			clearInterval(intervals[name] as number);
		}

		callbackRefs.current[name] = callback;

		const intervalId = window.setInterval(() => {
			callbackRefs.current[name]?.();
		}, delay);

		setIntervals((prev) => ({
			...prev,
			[name]: intervalId,
		}));
	};

	const stopInterval = (name: string) => {
		if (intervals[name]) {
			clearInterval(intervals[name] as number);
			setIntervals((prev) => ({
				...prev,
				[name]: null,
			}));
		}
	};

	return {
		startInterval,
		stopInterval,
	};
};
