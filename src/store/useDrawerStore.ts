import { StateCreator } from "zustand";
import { createWithEqualityFn as create } from "zustand/traditional";

import { DrawerStore } from "@interfaces/store";

const store: StateCreator<DrawerStore> = (set) => ({
	drawers: {},
	openDrawer: (name) =>
		set((state) => ({
			drawers: { ...state.drawers, [name]: true },
		})),
	closeDrawer: (name) =>
		set((state) => ({
			drawers: { ...state.drawers, [name]: false },
		})),
});

export const useDrawerStore = create(store);
