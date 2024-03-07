import { IUIGlobalStore } from "@interfaces/store";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

const store: StateCreator<IUIGlobalStore> = (set) => ({
	lastMenuUpdate: Date.now(),
	isFullScreen: false,
	toggleFullScreen: () =>
		set((state) => ({
			...state,
			isFullScreen: !state.isFullScreen,
		})),
	updateLastMenuTime: (newTime: number) =>
		set((state) => ({
			...state,
			lastMenuUpdate: newTime,
		})),
});

export const useUiGlobalStore = create(persist(store, { name: "UIGlobalStore" }));
