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
	loadAllLogs: async (sessionId, pageSize) => {
		try {
			set({ loading: true });

			const { data: sessionInfo, error: sessionInfoError } = await SessionsService.getSessionInfo(sessionId);
			if (sessionInfoError || !sessionInfo) {
				throw sessionInfoError || new Error(t("session.viewer.sessionNotFound", { ns: "deployments" }));
			}

			let allOutputs: SessionOutputData["outputs"] = [];
			let pageToken: string | undefined;

			do {
				const { data, error } = await SessionsService.getOutputsBySessionId(sessionId, pageToken, pageSize);

				if (error || !data) {
					set({ loading: false });
					return { error: true };
				}

				const reversedLogs = [...data.logs].reverse();
				allOutputs = [...reversedLogs, ...allOutputs];
				pageToken = data.nextPageToken || undefined;
			} while (pageToken);

			const finishedStates = new Set([
				SessionStateType.error,
				SessionStateType.completed,
				SessionStateType.stopped,
			]);
			const isSessionFinished = finishedStates.has(sessionStateConverter(sessionInfo.state) as SessionStateType);

			if (isSessionFinished) {
				const { data: sessionStateRecords } = await SessionsService.getLogRecordsBySessionId(
					sessionId,
					undefined,
					1,
					SessionLogType.State
				);

				if (sessionStateRecords?.records?.length) {
					const [lastStateRecord] = sessionStateRecords.records;
					const lastSessionState = convertSessionLogProtoToViewerOutput(lastStateRecord);
					if (lastSessionState) {
						allOutputs = [...allOutputs, lastSessionState];
					}
				}
			}

			set((state) => ({
				sessions: {
					...state.sessions,
					[sessionId]: {
						outputs: allOutputs,
						nextPageToken: "",
						hasLastSessionState: isSessionFinished,
					},
				},
				loading: false,
			}));

			return { error: false };
		} catch (error: unknown) {
			LoggerService.error(
				namespaces.stores.outputStore,
				t("outputLogsFetchErrorExtended", { ns: "errors", error: (error as Error).message })
			);
			set({ loading: false });
			return { error: true };
		}
	},
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

			const reversedLogs = [...logs].reverse();
			const outputs = force ? reversedLogs : [...reversedLogs, ...currentSession.outputs];

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
					const finalOutputs = [...outputs, lastSessionState];

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
