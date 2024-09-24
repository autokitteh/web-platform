import i18n from "i18next";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { DeploymentsService } from "@services";
import { SessionsService } from "@services/sessions.service";
import { minimumSessionLogsRecordsFrameHeightFallback } from "@src/constants";
import { StoreName } from "@src/enums";
import { Deployment } from "@src/types/models";

import { useToastStore } from "@store";

export interface CacheStore {
	logs: ProtoSessionLogRecord[];
	loading: boolean;
	loadingDeployments: boolean;
	reset: () => void;
	reload: (sessionId: string) => void;
	loadLogs: (sessionId: string, pageSize?: number) => Promise<void>;
	nextPageToken?: string;
	fetchDeployments: (projectId: string, force?: boolean) => Promise<void | Deployment[]>;
	deployments?: Deployment[];
	currentProjectId?: string;
}

const store: StateCreator<CacheStore> = (set, get) => ({
	logs: [],
	loading: false,
	nextPageToken: "",
	deployments: undefined,
	loadingDeployments: false,
	currentProjectId: undefined,

	fetchDeployments: async (projectId: string, force?: boolean) => {
		const addToast = useToastStore.getState().addToast;
		const { currentProjectId, deployments } = get();

		if (currentProjectId === projectId && !force) {
			return deployments;
		}

		set((state) => ({ ...state, currentProjectId: projectId }));
		set({ loadingDeployments: true });
		const { data: incomingDeployments, error } = await DeploymentsService.listByProjectId(projectId);
		set({ loadingDeployments: false });

		if (error) {
			const errorMsg = i18n.t("errorFetchingDeployments", { ns: "errors" });

			addToast({
				message: errorMsg,
				type: "error",
			});

			return;
		}

		if (deployments !== incomingDeployments) {
			set((state) => ({ ...state, deployments: incomingDeployments }));
		}

		return deployments;
	},

	reset: () => {
		set((state) => {
			state.logs = [];

			return state;
		});
	},

	reload: (sessionId: string) => {
		set((state) => {
			state.logs = [];
			state.nextPageToken = "";

			return state;
		});
		const { loadLogs } = get();
		loadLogs(sessionId, minimumSessionLogsRecordsFrameHeightFallback);
	},

	loadLogs: async (sessionId: string, pageSize?: number) => {
		set({ loading: true });

		try {
			const { nextPageToken } = get();
			const { data, error } = await SessionsService.getLogRecordsBySessionId(sessionId, nextPageToken, pageSize);

			if (error) {
				useToastStore.getState().addToast({
					message: `An error occurred: ${error}`,
					type: "error",
				});
			}

			if (data) {
				set({ loading: false });

				set((state) => ({
					logs: [...state.logs, ...data.records],
					nextPageToken: data.nextPageToken,
				}));
			}
		} catch (error) {
			useToastStore.getState().addToast({
				message: `An error occurred: ${error.message}`,
				type: "error",
			});
		} finally {
			set({ loading: false });
		}
	},
});

export const useCacheStore = create(persist(store, { name: StoreName.cache }));
