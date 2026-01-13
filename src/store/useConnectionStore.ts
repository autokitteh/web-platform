import { t } from "i18next";
import { StateCreator, create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { ConnectionStore } from "@interfaces/store";
import { ConnectionService, LoggerService } from "@services";
import { namespaces, connectionStatusCheckInterval, maxConnectionsCheckRetries } from "@src/constants";
import { TourId } from "@src/enums";
import { MessageTypes } from "@src/types";
import { ConnectionStatusType } from "@type/models";

import { useToastStore, useTourStore } from "@store";

const store: StateCreator<ConnectionStore> = (set, get) => ({
	retries: {},
	connectionIntervals: {},
	connectionTimeouts: {},
	avoidNextRerenderCleanup: true,
	connectionInProgress: false,
	isLoadingFromChatbot: false,
	editingConnectionId: undefined,
	fetchConnectionsCallback: () => {},
	tourStepAdvanced: [],

	incrementRetries: (connectionId: string) => {
		set((state) => {
			state.retries[connectionId] = (state.retries[connectionId] || 0) + 1;

			return state;
		});
	},

	setFetchConnectionsCallback: (callback) => {
		set((state) => {
			state.fetchConnectionsCallback = callback;

			return state;
		});
	},

	resetChecker: (connectionId?: string, force?: boolean) => {
		const { avoidNextRerenderCleanup, connectionIntervals, connectionTimeouts } = get();

		if (avoidNextRerenderCleanup && !force) {
			set((state) => {
				state.avoidNextRerenderCleanup = false;

				return state;
			});

			return;
		}

		if (connectionId) {
			const intervalId = connectionIntervals[connectionId];
			const timeoutId = connectionTimeouts[connectionId];
			if (intervalId) {
				clearInterval(intervalId);
			}
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			set((state) => {
				delete state.retries[connectionId];
				delete state.connectionIntervals[connectionId];
				delete state.connectionTimeouts[connectionId];

				return state;
			});

			return;
		}

		if (!Object.keys(connectionIntervals).length && !Object.keys(connectionTimeouts).length) {
			return;
		}

		for (const intervalId of Object.values(connectionIntervals)) {
			clearInterval(intervalId);
		}
		for (const timeoutId of Object.values(connectionTimeouts)) {
			clearTimeout(timeoutId);
		}

		set((state) => {
			state.retries = {};
			state.connectionIntervals = {};
			state.connectionTimeouts = {};

			return state;
		});
	},

	stopCheckingStatus: (connectionId: string) => {
		const { connectionIntervals, connectionTimeouts } = get();

		const intervalId = connectionIntervals[connectionId];
		const timeoutId = connectionTimeouts[connectionId];
		if (intervalId) {
			clearInterval(intervalId);
		}
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		set((state) => {
			delete state.retries[connectionId];
			delete state.connectionIntervals[connectionId];
			delete state.connectionTimeouts[connectionId];

			return state;
		});
	},

	startCheckingStatus: (connectionId) => {
		const { incrementRetries, resetChecker, connectionIntervals, connectionTimeouts } = get();
		const addToast = useToastStore.getState().addToast;

		if (connectionIntervals[connectionId]) {
			clearInterval(connectionIntervals[connectionId]);
		}
		if (connectionTimeouts[connectionId]) {
			clearTimeout(connectionTimeouts[connectionId]);
		}

		set((state) => {
			state.retries[connectionId] = 0;
			state.avoidNextRerenderCleanup = true;

			return state;
		});

		const checkStatus = async () => {
			const { connectionIntervals, fetchConnectionsCallback, retries, tourStepAdvanced } = get();

			// Guard against race conditions: if resetChecker/stopCheckingStatus was called
			// while this callback was queued, skip execution to avoid stale API calls
			if (!(connectionId in connectionIntervals) && !(connectionId in connectionTimeouts)) {
				return;
			}

			const connectionRetries = retries[connectionId] || 0;

			if (connectionRetries >= maxConnectionsCheckRetries) {
				resetChecker(connectionId);

				return;
			}

			try {
				const { data: connectionDetails, error } = await ConnectionService.get(connectionId);

				if (error) {
					const toastMessage = t("errorFetchingConnection", { connectionId, ns: "errors" });
					const logeExtended = t("errorFetchingConnectionExtended", {
						connectionId,
						error: (error as Error).message,
						ns: "errors",
					});
					addToast({
						message: toastMessage,
						type: "error",
					});

					LoggerService.error(namespaces.stores.connectionCheckerStore, logeExtended);
					return;
				}

				if (connectionDetails?.status === ("ok" as ConnectionStatusType).toString()) {
					try {
						const { iframeCommService } = await import("@services/iframeComm.service");
						iframeCommService.sendEvent(MessageTypes.REFRESH_CONNECTION, {
							id: connectionDetails.connectionId,
						});
					} catch (e) {
						LoggerService.error(
							namespaces.stores.connectionCheckerStore,
							"Failed to send REFRESH_CONNECTION event to iframe",
							e
						);
					}
					const { activeTour, nextStep } = useTourStore.getState();
					if (
						!tourStepAdvanced.includes(activeTour!.tourId as TourId) &&
						(activeTour?.tourId === TourId.sendEmail || activeTour?.tourId === TourId.sendSlack)
					) {
						nextStep(window.location.pathname);
						set((state) => {
							state.tourStepAdvanced.push(activeTour!.tourId as TourId);
							return state;
						});
					}
					if (fetchConnectionsCallback) {
						fetchConnectionsCallback();
					}
					resetChecker(connectionId);
					return;
				} else {
					incrementRetries(connectionId);
				}
			} catch (error) {
				addToast({
					message: (error as Error).message,
					type: "error",
				});
				resetChecker(connectionId);
			}
		};

		const timeoutId = setTimeout(checkStatus, 3000);
		const intervalId = setInterval(checkStatus, connectionStatusCheckInterval);

		set((state) => {
			state.connectionIntervals[connectionId] = intervalId;
			state.connectionTimeouts[connectionId] = timeoutId;

			return state;
		});
	},
	setConnectionInProgress: (value) => {
		set((state) => {
			if (state.connectionInProgress === value) return state;

			state.connectionInProgress = value;

			return state;
		});
	},
	setIsLoadingFromChatbot: (value) => {
		set((state) => {
			state.isLoadingFromChatbot = value;

			return state;
		});
	},
	setEditingConnectionId: (connectionId) => {
		set((state) => {
			state.editingConnectionId = connectionId;

			return state;
		});
	},
});

export const useConnectionStore = create(immer(store));
