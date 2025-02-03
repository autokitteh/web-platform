import i18n from "i18next";
import { StateCreator, create } from "zustand";

import { LoggerService } from "@services/index";
import { SessionsService } from "@services/sessions.service";
import { namespaces } from "@src/constants";
import { SessionLogType } from "@src/enums";
import { OutputsStore, SessionOutputData } from "@src/interfaces/store";
import { convertSessionLogProtoToViewerOutput } from "@src/models";

const initialSessionState = { outputs: [], nextPageToken: "", fullyLoaded: false } as SessionOutputData;

const createOutputsStore: StateCreator<OutputsStore> = (set, get) => ({
	sessions: {},
	loading: false,
	loadLogs: async (sessionId, pageSize, force) => {
		try {
			set({ loading: true });

			const currentSession = force ? initialSessionState : (get().sessions[sessionId] ?? initialSessionState);

			if (currentSession.fullyLoaded && !force) {
				return { error: false };
			}

			const { data, error } = await SessionsService.getLogRecordsBySessionId(
				sessionId,
				currentSession.nextPageToken || undefined,
				pageSize,
				SessionLogType.Output
			);

			if (error || !data) {
				set((state) => ({
					sessions: {
						...state.sessions,
						[sessionId]: initialSessionState,
					},
					loading: false,
				}));
				return { error: true };
			}

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

			return { error: false };
		} catch (error: unknown) {
			LoggerService.error(
				namespaces.stores.outputStore,
				i18n.t("outputLogsFetchErrorExtended", {
					ns: "errors",
					error: (error as Error).message,
				})
			);
			return { error: true };
		} finally {
			set({ loading: false });
		}
	},
});

export const useOutputsCacheStore = create(createOutputsStore);
