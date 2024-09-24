import i18n from "i18next";
import { StateCreator, create } from "zustand";

import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { DeploymentsService } from "@services";
import { SessionsService } from "@services/sessions.service";
import { minimumSessionLogsRecordsFrameHeightFallback } from "@src/constants";
import { Deployment } from "@src/types/models";

import { useToastStore } from "@store";

interface LoadingState {
	logs: boolean;
	deployments: boolean;
}

export interface CacheStore {
	logs: ProtoSessionLogRecord[];
	deployments?: Deployment[];
	loading: LoadingState;
	nextPageToken: string;
	currentProjectId?: string;
	reset: () => void;
	reload: (sessionId: string) => void;
	loadLogs: (sessionId: string, pageSize?: number) => Promise<void>;
	fetchDeployments: (projectId: string, force?: boolean) => Promise<void | Deployment[]>;
}

const initialState: Pick<CacheStore, "logs" | "loading" | "nextPageToken" | "deployments" | "currentProjectId"> = {
	logs: [],
	loading: {
		logs: false,
		deployments: false,
	},
	nextPageToken: "",
	deployments: undefined,
	currentProjectId: undefined,
};

const store: StateCreator<CacheStore> = (set, get) => ({
	...initialState,

	fetchDeployments: async (projectId: string, force?: boolean) => {
		const { currentProjectId, deployments } = get();
		if (currentProjectId === projectId && !force) {
			return deployments;
		}

		set((state) => ({
			...state,
			currentProjectId: projectId,
			loading: { ...state.loading, deployments: true },
		}));

		try {
			const { data: incomingDeployments, error } = await DeploymentsService.listByProjectId(projectId);

			if (error) {
				const errorMsg = i18n.t("errorFetchingDeployments", { ns: "errors" });

				useToastStore.getState().addToast({
					message: errorMsg,
					type: "error",
				});
			}

			set((state) => ({
				...state,
				deployments: incomingDeployments,
				loading: { ...state.loading, deployments: false },
			}));

			return incomingDeployments;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			const errorMsg = i18n.t("errorFetchingDeployments", { ns: "errors" });
			useToastStore.getState().addToast({
				message: errorMsg,
				type: "error",
			});
			set((state) => ({ ...state, loading: { ...state.loading, deployments: false } }));
		}
	},

	reset: () => set((state) => ({ ...state, ...initialState })),

	reload: (sessionId: string) => {
		set((state) => ({ ...state, logs: [], nextPageToken: "" }));
		get().loadLogs(sessionId, minimumSessionLogsRecordsFrameHeightFallback);
	},

	loadLogs: async (sessionId: string, pageSize?: number) => {
		set((state) => ({ ...state, loading: { ...state.loading, logs: true } }));

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
				set((state) => ({
					logs: [...state.logs, ...data.records],
					nextPageToken: data.nextPageToken,
					loading: { ...state.loading, logs: false },
				}));
			}
		} catch (error) {
			useToastStore.getState().addToast({
				message: `An error occurred: ${error.message}`,
				type: "error",
			});
		} finally {
			set((state) => ({ ...state, loading: { ...state.loading, logs: false } }));
		}
	},
});

export const useCacheStore = create<CacheStore>(store);
