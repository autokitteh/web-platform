import { useCallback, useEffect, useRef } from "react";

import { useShallow } from "zustand/react/shallow";

import { useDashboardStore } from "@store/useDashboardStore";

interface UseDashboardAutoRefreshOptions {
	onRefresh: () => void | Promise<void>;
	enabled?: boolean;
}

export const useDashboardAutoRefresh = ({ onRefresh, enabled = true }: UseDashboardAutoRefreshOptions) => {
	const { autoRefreshIntervalMs, isAutoRefreshEnabled } = useDashboardStore(
		useShallow((state) => ({
			autoRefreshIntervalMs: state.autoRefreshIntervalMs,
			isAutoRefreshEnabled: state.isAutoRefreshEnabled,
		}))
	);

	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const onRefreshRef = useRef(onRefresh);

	useEffect(() => {
		onRefreshRef.current = onRefresh;
	}, [onRefresh]);

	const clearRefreshInterval = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	const startRefreshInterval = useCallback(() => {
		clearRefreshInterval();
		intervalRef.current = setInterval(() => {
			onRefreshRef.current();
		}, autoRefreshIntervalMs);
	}, [autoRefreshIntervalMs, clearRefreshInterval]);

	useEffect(() => {
		const shouldRefresh = enabled && isAutoRefreshEnabled;

		if (shouldRefresh) {
			startRefreshInterval();
		} else {
			clearRefreshInterval();
		}

		return clearRefreshInterval;
	}, [enabled, isAutoRefreshEnabled, startRefreshInterval, clearRefreshInterval]);

	const triggerManualRefresh = useCallback(() => {
		onRefreshRef.current();
		if (enabled && isAutoRefreshEnabled) {
			startRefreshInterval();
		}
	}, [enabled, isAutoRefreshEnabled, startRefreshInterval]);

	return {
		triggerManualRefresh,
		isAutoRefreshActive: enabled && isAutoRefreshEnabled,
	};
};
