import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { ConnectionCheckerStore } from "@interfaces/store";

const store: StateCreator<ConnectionCheckerStore> = (set) => ({
	setCheckerInterval: (connectionId: string) =>
		set((state) => {
			state.connectionId = connectionId;
			state.retries = 0;

			return state;
		}),
	incrementRetries: () =>
		set((state) => {
			state.retries += 1;

			return state;
		}),
	resetChecker: () =>
		set((state) => {
			state.connectionId = "";
			state.retries = 0;

			return state;
		}),
	connectionId: "",
	retries: 0,
});

export const useConnectionCheckerStore = create(persist(immer(store), { name: StoreName.project }));
