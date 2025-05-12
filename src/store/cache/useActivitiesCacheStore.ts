import { t } from "i18next";
import { StateCreator, create } from "zustand";

import { LoggerService, SessionsService } from "@services";
import { namespaces } from "@src/constants";
import { SessionLogType } from "@src/enums";
import { ActivitiesStore } from "@src/interfaces/store";
import { convertSessionLogRecordsProtoToActivitiesModel } from "@src/models";

const initialSessionState = {
	activities: [],
	nextPageToken: "",
	hasLastSessionState: false,
	baseActivities: [],
};

const createActivitiesStore: StateCreator<ActivitiesStore> = (set, get) => ({
	sessions: {},
	loading: false,
	hasLastSessionState: false,
	loadLogs: async (sessionId, pageSize, force) => {
		try {
			set({ loading: true });

			const currentSession = force ? initialSessionState : (get().sessions[sessionId] ?? initialSessionState);

			const { data, error } = await SessionsService.getLogRecordsBySessionId(
				sessionId,
				currentSession.nextPageToken || undefined,
				pageSize,
				SessionLogType.Activity
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

			const newPageChronological = [...data.records];

			const protoSessionActivityRecords = force
				? newPageChronological
				: [...currentSession.baseActivities, ...newPageChronological];

			const convertedActivities = convertSessionLogRecordsProtoToActivitiesModel(protoSessionActivityRecords);

			set((state) => ({
				sessions: {
					...state.sessions,
					[sessionId]: {
						activities: convertedActivities,
						nextPageToken: data.nextPageToken,
						baseActivities: protoSessionActivityRecords,
					},
				},
			}));

			return { error: false };
		} catch (error: unknown) {
			LoggerService.error(
				namespaces.stores.activitiesStore,
				t("activityLogsFetchErrorExtended", {
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

export const useActivitiesCacheStore = create(createActivitiesStore);
