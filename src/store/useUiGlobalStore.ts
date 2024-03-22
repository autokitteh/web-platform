import { EStoreName } from "@enums";
import { IUIGlobalStore } from "@interfaces/store";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

const store: StateCreator<IUIGlobalStore> = (set) => ({
	isFullScreen: true,
	toggleFullScreen: () =>
		set((state) => ({
			...state,
			isFullScreen: !state.isFullScreen,
		})),
});

export const useUiGlobalStore = create(persist(store, { name: EStoreName.uiGlobal }));
