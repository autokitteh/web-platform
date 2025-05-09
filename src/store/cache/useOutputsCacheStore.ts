import { t } from "i18next";
import { StateCreator, create } from "zustand";

import { LoggerService } from "@services/index";
import { SessionsService } from "@services/sessions.service";
import { namespaces } from "@src/constants";
import { SessionLogType, SessionStateType } from "@src/enums";
import { OutputsStore, SessionOutputData } from "@src/interfaces/store";
import { convertSessionLogProtoToViewerOutput } from "@src/models";
import { sessionStateConverter } from "@src/models/utils/sessionsStateConverter.utils";

const initialSessionState = { outputs: [], nextPageToken: "", hasLastSessionState: false } as SessionOutputData;

const createOutputsStore: StateCreator<OutputsStore> = (set, get) => ({
	sessions: {},
	loading: false,
	loadLogs: async (sessionId, pageSize, force) => {
		try {
			set({ loading: true });

			const { data: sessionInfo, error: sessionInfoError } = await SessionsService.getSessionInfo(sessionId);
			if (sessionInfoError || !sessionInfo)
				throw sessionInfoError
					? sessionInfoError
					: new Error(t("session.viewer.sessionNotFound", { ns: "deployments" }));

			const currentSession = force ? initialSessionState : (get().sessions[sessionId] ?? initialSessionState);

			const { data, error } = await SessionsService.getOutputsBySessionId(
				sessionId,
				currentSession.nextPageToken || undefined,
				pageSize
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

			const { logs, nextPageToken } = data;

			let outputs;
			if (force) {
				outputs = [...logs];
			} else {
				outputs = [...currentSession.outputs, ...logs];
			}

			const isSessionFinished =
				[SessionStateType.error, SessionStateType.completed, SessionStateType.stopped].includes(
					sessionStateConverter(sessionInfo.state) as SessionStateType
				) && !nextPageToken;

			if (!currentSession.hasLastSessionState) {
				const { data: sessionStateRecords, error: sessionStateRequestError } =
					await SessionsService.getLogRecordsBySessionId(sessionId, undefined, 1, SessionLogType.State);

				if (sessionStateRequestError || !sessionStateRecords) {
					set((state) => ({
						sessions: {
							...state.sessions,
							[sessionId]: initialSessionState,
						},
						loading: false,
					}));
					return { error: true };
				}

				const lastSessionState = convertSessionLogProtoToViewerOutput(sessionStateRecords?.records?.[0]);

				if (lastSessionState) {
					outputs.unshift(lastSessionState);
				}
			}

			set((state) => ({
				sessions: {
					...state.sessions,
					[sessionId]: {
						outputs,
						nextPageToken,
						hasLastSessionState: isSessionFinished,
					},
				},
			}));

			return { error: false };
		} catch (error: unknown) {
			LoggerService.error(
				namespaces.stores.outputStore,
				t("outputLogsFetchErrorExtended", {
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
