import { IMenuStore } from "@interfaces/store";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

const store: StateCreator<IMenuStore> = (set) => ({
	lastMenuUpdate: Date.now(),
	updateLastMenuTime: (newTime: number) =>
		set((state) => ({
			...state,
			lastMenuUpdate: newTime,
		})),
});

export const useMenuStore = create(persist(store, { name: "MenuStore" }));
