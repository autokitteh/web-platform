import { StateCreator, create } from "zustand";

import { DrawerStore } from "@interfaces/store";

const store: StateCreator<DrawerStore> = (set) => ({
	data: undefined,
	drawers: {},
	openDrawer: (name, data) =>
		set((state) => ({
			data,
			drawers: { ...state.drawers, [name]: true },
		})),
	closeDrawer: (name) =>
		set((state) => ({
			data: undefined,
			drawers: { ...state.drawers, [name]: false },
		})),
});

export const useDrawerStore = create(store);
