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

			const outputs = force ? [...logs] : [...currentSession.outputs, ...logs];

			const finishedStates = new Set([
				SessionStateType.error,
				SessionStateType.completed,
				SessionStateType.stopped,
			]);
			const isSessionFinished = finishedStates.has(sessionStateConverter(sessionInfo.state) as SessionStateType);
			const updateSession = (sessionUpdates: SessionOutputData) =>
				set((state) => ({
					sessions: {
						...state.sessions,
						[sessionId]: {
							...state.sessions[sessionId],
							...sessionUpdates,
						},
					},
					loading: false,
				}));

			if (!currentSession.hasLastSessionState && isSessionFinished) {
				const { data: sessionStateRecords, error: sessionStateRequestError } =
					await SessionsService.getLogRecordsBySessionId(sessionId, undefined, 1, SessionLogType.State);

				if (sessionStateRequestError || !sessionStateRecords) {
					updateSession({
						...initialSessionState,
						hasLastSessionState: false,
					});
					return { error: true };
				}

				const [lastStateRecord] = sessionStateRecords.records ?? [];
				const lastSessionState = convertSessionLogProtoToViewerOutput(lastStateRecord);

				if (lastSessionState) {
					const finalOutputs = [lastSessionState, ...outputs];

					updateSession({
						outputs: finalOutputs,
						nextPageToken,
						hasLastSessionState: true,
					});
					return { error: false };
				}
			}
			updateSession({
				outputs,
				nextPageToken,
				hasLastSessionState: currentSession.hasLastSessionState,
			});

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
