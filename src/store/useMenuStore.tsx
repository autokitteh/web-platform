import { IMenuStore } from "@interfaces/store";
import { StateCreator, create } from "zustand";

const store: StateCreator<IMenuStore> = (set) => ({
	projectUpdateCount: 0,
	updateProject: () =>
		set((state) => ({
			...state,
			projectUpdateCount: state.projectUpdateCount + 1,
		})),
});

export const useMenuStore = create(store);
