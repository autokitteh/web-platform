import i18n from "i18next";
import { StateCreator, create } from "zustand";

import { LoggerService, SessionsService } from "@services";
import { namespaces } from "@src/constants";
import { SessionLogType } from "@src/enums";
import { ActivitiesStore } from "@src/interfaces/store";
import { convertSessionLogRecordsProtoToActivitiesModel } from "@src/models";

import { useToastStore } from "@store";

const createActivitiesStore: StateCreator<ActivitiesStore> = (set, get) => ({
	sessions: {},
	loading: false,

	reset: (sessionId) =>
		set((state) => ({
			sessions: {
				...state.sessions,
				[sessionId]: { activities: [], nextPageToken: undefined, fullyLoaded: false },
			},
		})),

	reload: (sessionId, pageSize) => {
		get().reset(sessionId);
		get().loadLogs(sessionId, pageSize);
	},

	loadLogs: async (sessionId, pageSize) => {
		set({ loading: true });

		try {
			const currentSession = get().sessions[sessionId] || {
				activities: [],
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
				SessionLogType.Activity
			);

			if (error) {
				useToastStore.getState().addToast({
					message: i18n.t("activityLogsFetchError", { ns: "errors" }),
					type: "error",
				});
			}

			if (data) {
				set((state) => ({
					sessions: {
						...state.sessions,
						[sessionId]: {
							activities: [
								...currentSession.activities,
								...convertSessionLogRecordsProtoToActivitiesModel(data.records),
							],
							nextPageToken: data.nextPageToken,
							fullyLoaded: !data.nextPageToken,
						},
					},
				}));
			}
		} catch (error) {
			useToastStore.getState().addToast({
				message: i18n.t("activityLogsFetchError", { ns: "errors" }),
				type: "error",
			});
			LoggerService.error(
				namespaces.stores.activitiesStore,
				i18n.t("activityLogsFetchErrorExtended", { ns: "errors", error: (error as Error).message })
			);
		} finally {
			set({ loading: false });
		}
	},
});

export const useActivitiesCacheStore = create(createActivitiesStore);
