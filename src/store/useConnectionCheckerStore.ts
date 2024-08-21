import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { ConnectionCheckerStore } from "@interfaces/store";

const store: StateCreator<ConnectionCheckerStore> = (set) => ({
	setCheckerInterval: (connectionId: string) =>
		set((state) => ({
			...state,
			connectionId,
			retries: 0,
		})),
	incrementRetries: () =>
		set((state) => ({
			...state,
			retries: state.retries + 1,
		})),
	resetChecker: () =>
		set(() => ({
			connectionId: "",
			retries: 0,
		})),
	connectionId: "",
	retries: 0,
});

export const useConnectionCheckerStore = create(persist(immer(store), { name: StoreName.project }));
