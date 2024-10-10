import i18n from "i18next";
import { StateCreator, create } from "zustand";

import { LoggerService } from "@services/index";
import { SessionsService } from "@services/sessions.service";
import { minimumSessionLogsRecordsFrameHeightFallback, namespaces } from "@src/constants";
import { SessionLogType } from "@src/enums";
import { OutputsStore } from "@src/interfaces/store";
import { convertSessionLogProtoToViewerOutput } from "@src/models";

import { useToastStore } from "@store";

const createOutputsStore: StateCreator<OutputsStore> = (set, get) => ({
	sessions: {},
	loading: false,

	reset: (sessionId: string) =>
		set((state) => ({
			sessions: {
				...state.sessions,
				[sessionId]: { outputs: [], nextPageToken: undefined, fullyLoaded: false },
			},
		})),

	reload: (sessionId: string) => {
		get().reset(sessionId);
		get().loadLogs(sessionId, minimumSessionLogsRecordsFrameHeightFallback);
	},

	loadLogs: async (sessionId, pageSize) => {
		set({ loading: true });

		try {
			const currentSession = get().sessions[sessionId] || {
				outputs: [],
				nextPageToken: null,
				fullyLoaded: false,
			};

			if (currentSession.fullyLoaded) {
				set({ loading: false });

				return;
			}

			const { data, error } = await SessionsService.getLogRecordsBySessionId(
				sessionId,
				currentSession.nextPageToken || undefined,
				pageSize,
				SessionLogType.Output
			);

			if (error) {
				useToastStore.getState().addToast({
					message: i18n.t("outputLogsFetchError", { ns: "errors" }),
					type: "error",
				});
			}

			if (data) {
				set((state) => ({
					sessions: {
						...state.sessions,
						[sessionId]: {
							outputs: [...currentSession.outputs, ...convertSessionLogProtoToViewerOutput(data.records)],
							nextPageToken: data.nextPageToken,
							fullyLoaded: !data.nextPageToken,
						},
					},
				}));
			}
		} catch (error) {
			useToastStore.getState().addToast({
				message: i18n.t("outputLogsFetchError", { ns: "errors" }),
				type: "error",
			});
			LoggerService.error(
				namespaces.stores.outputStore,
				i18n.t("outputLogsFetchErrorExtended", { ns: "errors", error: (error as Error).message })
			);
		} finally {
			set({ loading: false });
		}
	},
});

export const useOutputsCacheStore = create(createOutputsStore);