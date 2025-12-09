import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { autoRefreshIntervalMs, defaultTimeRange, DashboardTimeRange } from "@constants/statusColors.constants";
import { StoreName } from "@enums";
import { DashboardSummary } from "@interfaces/components/dashboardStats.interface";
import {
	ConnectionStatistics,
	DashboardState,
	DashboardStore,
	ScopeKeyParams,
	SessionStatistics,
	EventStatistics,
} from "@interfaces/store/dashboardStore.interface";

const defaultState: DashboardState = {
	timeRange: defaultTimeRange,
	autoRefreshIntervalMs: autoRefreshIntervalMs,
	isAutoRefreshEnabled: true,
	lastUpdatedAt: undefined,
	summary: undefined,
	sessionStatsByScope: {},
	eventStatsByScope: {},
	connectionStats: undefined,
	isLoading: false,
	error: undefined,
};

export const makeScopeKey = ({ projectId, deploymentId, timeRange }: ScopeKeyParams): string => {
	const parts: string[] = [];
	if (projectId) {
		parts.push(`project:${projectId}`);
	}
	if (deploymentId) {
		parts.push(`deployment:${deploymentId}`);
	}
	parts.push(`range:${timeRange}`);

	return parts.join("|");
};

const store: StateCreator<DashboardStore, [["zustand/immer", never]]> = (set) => ({
	...defaultState,

	setTimeRange: (timeRange: DashboardTimeRange) => {
		set((state) => {
			state.timeRange = timeRange;
		});
	},

	setAutoRefreshInterval: (ms: number) => {
		set((state) => {
			state.autoRefreshIntervalMs = ms;
		});
	},

	toggleAutoRefresh: (enabled: boolean) => {
		set((state) => {
			state.isAutoRefreshEnabled = enabled;
		});
	},

	setSummary: (summary: DashboardSummary) => {
		set((state) => {
			state.summary = summary;
		});
	},

	setSessionStats: (scopeKey: string, stats: SessionStatistics) => {
		set((state) => {
			state.sessionStatsByScope[scopeKey] = stats;
		});
	},

	setEventStats: (scopeKey: string, stats: EventStatistics) => {
		set((state) => {
			state.eventStatsByScope[scopeKey] = stats;
		});
	},

	setConnectionStats: (stats: ConnectionStatistics) => {
		set((state) => {
			state.connectionStats = stats;
		});
	},

	setLoading: (isLoading: boolean) => {
		set((state) => {
			state.isLoading = isLoading;
		});
	},

	setError: (error?: string) => {
		set((state) => {
			state.error = error;
		});
	},

	setLastUpdatedAt: (timestamp: string) => {
		set((state) => {
			state.lastUpdatedAt = timestamp;
		});
	},

	clearStats: () => {
		set((state) => {
			state.sessionStatsByScope = {};
			state.eventStatsByScope = {};
			state.connectionStats = undefined;
			state.summary = undefined;
		});
	},

	reset: () => {
		set(() => defaultState);
	},
});

export const useDashboardStore = create(persist(immer(store), { name: StoreName.dashboard }));
