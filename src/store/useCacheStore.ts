import { StateCreator, create } from "zustand";

import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { SessionsService } from "@services/sessions.service";
import { minimumSessionLogsRecordsToDisplayFallback } from "@src/constants";

import { useToastStore } from "@store";

export interface CacheStore {
	logs: ProtoSessionLogRecord[];
	loading: boolean;
	reset: () => void;
	reload: (sessionId: string) => void;
	loadLogs: (sessionId: string, pageSize?: number) => Promise<void>;
	nextPageToken?: string;
	displayedSessionId?: string;
}

const store: StateCreator<CacheStore> = (set, get) => ({
	logs: [],
	loading: false,
	nextPageToken: "",

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
			state.displayedSessionId = sessionId;

			return state;
		});
		const { loadLogs } = get();
		loadLogs(sessionId, minimumSessionLogsRecordsToDisplayFallback);
	},

	loadLogs: async (sessionId: string, pageSize?: number) => {
		set({ loading: true, displayedSessionId: sessionId });

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

export const useCacheStore = create(store);
