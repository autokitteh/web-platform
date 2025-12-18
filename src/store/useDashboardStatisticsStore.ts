import { StateCreator, create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { ActivityState } from "@constants/activities.constants";
import {
	ActiveDeploymentData,
	DashboardStatistics,
	DashboardStatisticsState,
	DashboardStatisticsStore,
	SessionsByStatus,
	SessionStatusChartData,
} from "@type/stores";

const defaultSessionsByStatus: SessionsByStatus = {
	completed: 0,
	running: 0,
	error: 0,
	stopped: 0,
	created: 0,
};

const defaultState: DashboardStatisticsState = {
	statistics: {
		totalProjects: 0,
		activeProjects: 0,
		totalDeployments: 0,
		activeDeployments: 0,
		sessionsByStatus: defaultSessionsByStatus,
	},
	activeDeploymentsList: [],
	sessionStatusData: [
		{ status: ActivityState.completed, count: 0 },
		{ status: ActivityState.running, count: 0 },
		{ status: ActivityState.error, count: 0 },
		{ status: ActivityState.stopped, count: 0 },
		{ status: ActivityState.created, count: 0 },
	],
	isLoading: true,
};

const store: StateCreator<DashboardStatisticsStore, [["zustand/immer", never]]> = (set) => ({
	...defaultState,

	setStatistics: (stats: DashboardStatistics) => {
		set((state) => {
			state.statistics = stats;
		});
	},

	setActiveDeployments: (deployments: ActiveDeploymentData[]) => {
		set((state) => {
			state.activeDeploymentsList = deployments;
		});
	},

	setSessionStatusData: (data: SessionStatusChartData[]) => {
		set((state) => {
			state.sessionStatusData = data;
		});
	},

	setIsLoading: (loading: boolean) => {
		set((state) => {
			state.isLoading = loading;
		});
	},

	reset: () => {
		set(() => defaultState);
	},
});

export const useDashboardStatisticsStore = create(immer(store));
