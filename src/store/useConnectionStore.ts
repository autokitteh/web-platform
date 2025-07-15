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
	retries: 0,
	recheckIntervalIds: [],
	avoidNextRerenderCleanup: true,
	connectionInProgress: false,
	fetchConnectionsCallback: () => {},
	tourStepAdvanced: [],

	incrementRetries: () => {
		set((state) => {
			state.retries += 1;

			return state;
		});
	},

	setFetchConnectionsCallback: (callback) => {
		set((state) => {
			state.fetchConnectionsCallback = callback;

			return state;
		});
	},

	resetChecker: (force) => {
		const { avoidNextRerenderCleanup, recheckIntervalIds } = get();

		if (avoidNextRerenderCleanup && !force) {
			set((state) => {
				state.avoidNextRerenderCleanup = false;

				return state;
			});

			return;
		}

		if (!recheckIntervalIds.length) {
			return;
		}
		for (const intervalId of recheckIntervalIds) {
			clearInterval(intervalId);
		}

		set((state) => {
			state.retries = 0;
			state.recheckIntervalIds = [];

			return state;
		});
	},

	startCheckingStatus: (connectionId) => {
		const { incrementRetries, resetChecker } = get();
		const addToast = useToastStore.getState().addToast;

		set((state) => {
			state.retries = 0;
			state.avoidNextRerenderCleanup = true;

			return state;
		});

		const checkStatus = async () => {
			const { fetchConnectionsCallback, retries, tourStepAdvanced } = get();

			if (retries >= maxConnectionsCheckRetries) {
				resetChecker();

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
					// Send REFRESH_CONNECTIONS event to iframe
					try {
						const { iframeCommService } = await import("@services/iframeComm.service");
						iframeCommService.sendEvent(MessageTypes.REFRESH_CONNECTIONS, {});
					} catch (e) {
						// eslint-disable-next-line no-console
						console.error("Failed to send REFRESH_CONNECTIONS event to iframe", e);
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
					if (fetchConnectionsCallback) fetchConnectionsCallback();
					resetChecker();
					return;
				} else {
					incrementRetries();
				}
			} catch (error) {
				addToast({
					message: (error as Error).message,
					type: "error",
				});
				resetChecker();
			}
		};

		setTimeout(checkStatus, 3000);

		const intervalId = setInterval(checkStatus, connectionStatusCheckInterval);

		set((state) => {
			const recheckIntervalIdsArr = [...state.recheckIntervalIds, intervalId];
			state.recheckIntervalIds = recheckIntervalIdsArr;

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
});

export const useConnectionStore = create(immer(store));
