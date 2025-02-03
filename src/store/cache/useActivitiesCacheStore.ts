import i18n from "i18next";
import { StateCreator, create } from "zustand";

import { LoggerService, SessionsService } from "@services";
import { namespaces } from "@src/constants";
import { SessionLogType } from "@src/enums";
import { ActivitiesStore } from "@src/interfaces/store";
import { convertSessionLogRecordsProtoToActivitiesModel } from "@src/models";

const createActivitiesStore: StateCreator<ActivitiesStore> = (set, get) => ({
	sessions: {},
	loading: false,

	loadLogs: async (sessionId, pageSize, force) => {
		set({ loading: true });

		try {
			const currentSession = get().sessions[sessionId] || {
				activities: [],
				nextPageToken: null,
				fullyLoaded: false,
			};

			if (currentSession.fullyLoaded && !force) {
				set({ loading: false });

				return { error: false };
			}

			const { data, error } = await SessionsService.getLogRecordsBySessionId(
				sessionId,
				currentSession.nextPageToken || undefined,
				pageSize,
				SessionLogType.Activity
			);

			if (error) {
				set({ loading: false });

				return { error: true };
			}

			if (!data) {
				set((state) => ({
					sessions: {
						...state.sessions,
						[sessionId]: {
							activities: [],
							nextPageToken: "",
							fullyLoaded: false,
						},
					},
					loading: false,
				}));
				return { error: true };
			}

			set((state) => ({
				sessions: {
					...state.sessions,
					[sessionId]: {
						activities: force
							? convertSessionLogRecordsProtoToActivitiesModel(data.records)
							: [
									...currentSession.activities,
									...convertSessionLogRecordsProtoToActivitiesModel(data.records),
								],
						nextPageToken: data.nextPageToken,
						fullyLoaded: !data.nextPageToken,
					},
				},
			}));
		} catch (error) {
			LoggerService.error(
				namespaces.stores.activitiesStore,
				i18n.t("activityLogsFetchErrorExtended", { ns: "errors", error: (error as Error).message })
			);
			set({ loading: false });
			return { error: true };
		}
		set({ loading: false });
		return { error: false };
	},
});

export const useActivitiesCacheStore = create(createActivitiesStore);
