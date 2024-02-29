import { IGlobalStore } from "@interfaces/store";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

const store: StateCreator<IGlobalStore> = (set) => ({
	isFullScreen: false,
	toggleFullScreen: () =>
		set((state) => ({
			...state,
			isFullScreen: !state.isFullScreen,
		})),
});

export const useGlobalStore = create(persist(store, { name: "GlobalStore" }));
