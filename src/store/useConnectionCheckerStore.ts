import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { ConnectionCheckerStore } from "@interfaces/store";
import { ConnectionService } from "@services";
import { ConnectionStatusType } from "@type/models";

import { useToastStore } from "@store";

const store: StateCreator<ConnectionCheckerStore> = (set, get) => ({
	connectionId: "",
	retries: 0,
	recheckIntervalId: null as NodeJS.Timeout | null,

	incrementRetries: () => {
		set((state) => {
			state.retries += 1;

			return state;
		});
	},

	resetChecker: () => {
		const { recheckIntervalId } = get();

		if (recheckIntervalId) {
			clearInterval(recheckIntervalId);
		}

		set((state) => {
			state.connectionId = "";
			state.retries = 0;
			state.recheckIntervalId = null;

			return state;
		});
	},

	startCheckingStatus: (connectionId: string) => {
		const { incrementRetries, resetChecker, retries } = get();
		const addToast = useToastStore.getState().addToast;

		if (!connectionId) return;

		set((state) => {
			state.connectionId = connectionId;
			state.retries = 0;

			return state;
		});

		const checkStatus = async () => {
			if (retries >= 6) {
				resetChecker();

				return;
			}

			try {
				const { data: connectionDetails, error } = await ConnectionService.get(connectionId);

				if (error) {
					addToast({
						id: Date.now().toString(),
						message: (error as Error).message,
						type: "error",
					});

					return;
				}

				if (connectionDetails?.status === ("ok" as ConnectionStatusType).toString()) {
					resetChecker();
				} else {
					incrementRetries();
				}
			} catch (error) {
				addToast({
					id: Date.now().toString(),
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
