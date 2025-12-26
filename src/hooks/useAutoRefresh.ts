import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAutoRefreshOptions {
	enabled?: boolean;
	intervalMs?: number;
	onRefresh: () => Promise<void>;
	pauseWhenHidden?: boolean;
}

export interface UseAutoRefreshReturn {
	countdownMs: number;
	isEnabled: boolean;
	isPaused: boolean;
	isRefreshing: boolean;
	pause: () => void;
	refreshNow: () => Promise<void>;
	resume: () => void;
	toggle: () => void;
}

const DEFAULT_INTERVAL_MS = 60000;

export function useAutoRefresh({
	enabled = true,
	intervalMs = DEFAULT_INTERVAL_MS,
	onRefresh,
	pauseWhenHidden = true,
}: UseAutoRefreshOptions): UseAutoRefreshReturn {
	const [isEnabled, setIsEnabled] = useState(enabled);
	const [isPaused, setIsPaused] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [countdownMs, setCountdownMs] = useState(intervalMs);

	const refreshInProgressRef = useRef(false);
	const lastRefreshTimeRef = useRef(Date.now());
	const countdownIntervalRef = useRef<ReturnType<typeof setInterval>>();
	const pausedAtRef = useRef<number | null>(null);
	const remainingWhenPausedRef = useRef<number | null>(null);
	const onRefreshRef = useRef(onRefresh);
	onRefreshRef.current = onRefresh;

	const executeRefresh = useCallback(async () => {
		if (refreshInProgressRef.current) {
			return;
		}

		refreshInProgressRef.current = true;
		setIsRefreshing(true);

		const minimumLoadingTime = new Promise((resolve) => setTimeout(resolve, 2500));

		try {
			await Promise.all([onRefreshRef.current(), minimumLoadingTime]);
		} finally {
			refreshInProgressRef.current = false;
			setIsRefreshing(false);
			lastRefreshTimeRef.current = Date.now();
			setCountdownMs(intervalMs);
		}
	}, [intervalMs]);

	const refreshNow = useCallback(async () => {
		await executeRefresh();
	}, [executeRefresh]);

	const pause = useCallback(() => {
		setIsPaused(true);
	}, []);

	const resume = useCallback(() => {
		setIsPaused(false);
		lastRefreshTimeRef.current = Date.now();
		setCountdownMs(intervalMs);
	}, [intervalMs]);

	const toggle = useCallback(() => {
		setIsEnabled((prev) => !prev);
	}, []);

	useEffect(() => {
		if (!isEnabled || isPaused) {
			if (countdownIntervalRef.current) {
				clearInterval(countdownIntervalRef.current);
			}
			return;
		}

		const updateCountdown = () => {
			const elapsed = Date.now() - lastRefreshTimeRef.current;
			const remaining = Math.max(0, intervalMs - elapsed);
			setCountdownMs(remaining);

			if (remaining <= 0 && !refreshInProgressRef.current) {
				executeRefresh();
			}
		};

		countdownIntervalRef.current = setInterval(updateCountdown, 1000);
		updateCountdown();

		return () => {
			if (countdownIntervalRef.current) {
				clearInterval(countdownIntervalRef.current);
			}
		};
	}, [isEnabled, isPaused, intervalMs, executeRefresh]);

	useEffect(() => {
		if (!pauseWhenHidden) return;

		const handleVisibilityChange = () => {
			if (document.hidden) {
				pausedAtRef.current = Date.now();
				const elapsed = Date.now() - lastRefreshTimeRef.current;
				remainingWhenPausedRef.current = Math.max(0, intervalMs - elapsed);
				setIsPaused(true);
			} else {
				setIsPaused(false);
				if (remainingWhenPausedRef.current !== null) {
					lastRefreshTimeRef.current = Date.now() - (intervalMs - remainingWhenPausedRef.current);
					setCountdownMs(remainingWhenPausedRef.current);
				}
				pausedAtRef.current = null;
				remainingWhenPausedRef.current = null;
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [pauseWhenHidden, intervalMs]);

	useEffect(() => {
		setIsEnabled(enabled);
	}, [enabled]);

	return {
		countdownMs,
		isEnabled,
		isPaused,
		isRefreshing,
		pause,
		refreshNow,
		resume,
		toggle,
	};
}
