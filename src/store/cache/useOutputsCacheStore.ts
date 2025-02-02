import i18n from "i18next";
import { StateCreator, create } from "zustand";

import { LoggerService } from "@services/index";
import { SessionsService } from "@services/sessions.service";
import { namespaces } from "@src/constants";
import { SessionLogType } from "@src/enums";
import { OutputsStore } from "@src/interfaces/store";
import { convertSessionLogProtoToViewerOutput } from "@src/models";

import { useToastStore } from "@store";

const createOutputsStore: StateCreator<OutputsStore> = (set, get) => ({
	sessions: {},
	loading: false,
	loadLogs: async (sessionId, pageSize, force) => {
		set({ loading: true });

		const initialSessionState = { outputs: [], nextPageToken: null, fullyLoaded: false };
		const currentSession = force ? initialSessionState : get().sessions[sessionId] || initialSessionState;

		if (currentSession.fullyLoaded && !force) {
			set({ loading: false });
			return;
		}

		try {
			const { data, error } = await SessionsService.getLogRecordsBySessionId(
				sessionId,
				currentSession.nextPageToken || undefined,
				pageSize,
				SessionLogType.Output
			);

			const addToast = useToastStore.getState().addToast;
			if (error) {
				addToast({
					message: i18n.t("outputLogsFetchError", { ns: "errors" }),
					type: "error",
				});
				return;
			}

			if (!data) return;

			const convertedOutputs = convertSessionLogProtoToViewerOutput(data.records);
			const outputs = force ? convertedOutputs : [...currentSession.outputs, ...convertedOutputs];

			set((state) => ({
				sessions: {
					...state.sessions,
					[sessionId]: {
						outputs,
						nextPageToken: data.nextPageToken,
						fullyLoaded: !data.nextPageToken,
					},
				},
			}));
		} catch (error) {
			const errorMessage = (error as Error).message;
			useToastStore.getState().addToast({
				message: i18n.t("outputLogsFetchError", { ns: "errors" }),
				type: "error",
			});
			LoggerService.error(
				namespaces.stores.outputStore,
				i18n.t("outputLogsFetchErrorExtended", { ns: "errors", error: errorMessage })
			);
		} finally {
			set({ loading: false });
		}
	},
});

export const useOutputsCacheStore = create(createOutputsStore);
