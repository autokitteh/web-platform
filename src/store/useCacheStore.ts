import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

import { DeploymentsService } from "@services";
import { SessionsService } from "@services/sessions.service";
import { minimumSessionLogsRecordsFrameHeightFallback } from "@src/constants";
import { StoreName } from "@src/enums";
import { convertSessionLogProtoToViewerOutput, convertSessionLogRecordsProtoToActivitiesModel } from "@src/models";
import { SessionActivity, SessionOutput } from "@src/types/models";

import { useToastStore } from "@store";

export interface CacheStore {
	activities: SessionActivity[];
	outputs: SessionOutput[];
	loading: boolean;
	reset: () => void;
	reload: (sessionId: string) => void;
	loadLogs: (sessionId: string, pageSize?: number) => Promise<void>;
	nextPageToken?: string;
	projectLastDeployment?: Record<string, string>;
	fetchLastDeploymentId: (projectId: string, force?: boolean) => Promise<void>;
}

const store: StateCreator<CacheStore> = (set, get) => ({
	activities: [],
	outputs: [],
	loading: false,
	nextPageToken: "",
	projectLastDeployment: undefined,

	fetchLastDeploymentId: async (projectId: string, force?: boolean) => {
		const { projectLastDeployment } = get();

		if (projectLastDeployment?.projectId === projectId && !force) {
			return;
		}

		const { data: deployments, error } = await DeploymentsService.listByProjectId(projectId);

		if (error) {
			return;
		}

		if (!deployments) {
			return;
		}
		if (!deployments.length) {
			set({
				projectLastDeployment: {
					[projectId]: "",
				},
			});

			return;
		}

		set({
			projectLastDeployment: {
				[projectId]: deployments[deployments.length - 1].deploymentId,
			},
		});
	},

	reset: () => {
		set((state) => ({
			...state,
			activities: [],
			outputs: [],
		}));
	},

	reload: (sessionId: string) => {
		set((state) => ({
			...state,
			activities: [],
			outputs: [],
			nextPageToken: "",
		}));
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
					activities: [...state.activities, ...convertSessionLogRecordsProtoToActivitiesModel(data.records)],
					outputs: [...state.outputs, ...convertSessionLogProtoToViewerOutput(data.records)],
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
