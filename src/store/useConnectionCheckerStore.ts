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

	setCheckerInterval: (connectionId: string) => {
		set((state) => {
			state.connectionId = connectionId;
			state.retries = 0;

			return state;
		});
	},

	incrementRetries: () => {
		set((state) => {
			state.retries += 1;

			return state;
		});
	},

	resetChecker: () => {
		set((state) => {
			state.connectionId = "";
			state.retries = 0;
			if (state.recheckIntervalId) {
				clearInterval(state.recheckIntervalId);
				state.recheckIntervalId = null;
			}

			return state;
		});
	},

	startCheckingStatus: () => {
		const { connectionId, incrementRetries, resetChecker, retries } = get();
		const addToast = useToastStore.getState().addToast;

		if (!connectionId) return;

		const checkStatus = async () => {
			if (retries >= 6) {
				resetChecker();
				clearInterval(get().recheckIntervalId!);

				return;
			}

			try {
				const { data: statusData, error } = await ConnectionService.test(connectionId);

				if (error) {
					addToast({
						id: Date.now().toString(),
						message: (error as Error).message,
						type: "error",
					});

					return;
				}

				if (statusData === ("ok" as ConnectionStatusType)) {
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
			}
		};

		const intervalId = setInterval(checkStatus, 10 * 1000);
		set((state) => {
			state.recheckIntervalId = intervalId;

			return state;
		});

		checkStatus();
	},
});

export const useConnectionCheckerStore = create(persist(immer(store), { name: StoreName.connectionChecker }));
