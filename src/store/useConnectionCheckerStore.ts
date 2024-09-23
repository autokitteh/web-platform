import i18n from "i18next";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { ConnectionCheckerStore } from "@interfaces/store";
import { ConnectionService, LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { ConnectionStatusType } from "@type/models";

import { useToastStore } from "@store";

const store: StateCreator<ConnectionCheckerStore> = (set, get) => ({
	retries: 0,
	recheckIntervalId: null,
	avoidNextRerenderCleanup: true,
	fetchConnectionsCallback: () => {},

	incrementRetries: () => {
		set((state) => {
			state.retries += 1;

			return state;
		});
	},

	setFetchConnectionsCallback: (callback: (() => void) | null) => {
		set((state) => {
			state.fetchConnectionsCallback = callback;

			return state;
		});
	},

	resetChecker: () => {
		const { avoidNextRerenderCleanup, recheckIntervalId } = get();

		if (avoidNextRerenderCleanup) {
			set((state) => {
				state.avoidNextRerenderCleanup = false;

				return state;
			});

			return;
		}

		if (!recheckIntervalId) {
			return;
		}
		clearInterval(recheckIntervalId);

		set((state) => {
			state.retries = 0;
			state.recheckIntervalId = null;

			return state;
		});
	},

	startCheckingStatus: (connectionId: string) => {
		const { incrementRetries, resetChecker } = get();
		const addToast = useToastStore.getState().addToast;

		set((state) => {
			state.retries = 0;
			state.avoidNextRerenderCleanup = true;

			return state;
		});

		const checkStatus = async () => {
			const { fetchConnectionsCallback, retries } = get();

			if (retries >= 6) {
				resetChecker();

				return;
			}

			try {
				const { data: connectionDetails, error } = await ConnectionService.get(connectionId);

				if (error) {
					const toastMessage = i18n.t("errorFetchingConnection", { connectionId, ns: "errors" });
					const logeExtended = i18n.t("errorFetchingConnectionExtended", {
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

				if (!connectionDetails) {
					addToast({
						message: i18n.t("connectionNotFound", { ns: "errors" }),
						type: "error",
					});

					LoggerService.error(
						namespaces.hooks.connectionForm,
						i18n.t("connectionNotFoundExtended", { ns: "errors", connectionId })
					);

					return;
				}

				if (connectionDetails.status === ("ok" as ConnectionStatusType).toString()) {
					if (fetchConnectionsCallback) fetchConnectionsCallback();
					resetChecker();
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

		const intervalId = setInterval(checkStatus, 10 * 1000);
		set((state) => {
			state.recheckIntervalId = intervalId;

			return state;
		});
	},
});

export const useConnectionCheckerStore = create(persist(immer(store), { name: StoreName.connectionChecker }));
