import { IMenuStore } from "@interfaces/store";
import { StateCreator, create } from "zustand";

const store: StateCreator<IMenuStore> = (set) => ({
	projectId: undefined,
	projectUpdateCount: 0,
	updateProject: (id: string) =>
		set((state) => ({
			...state,
			projectId: id,
			projectUpdateCount: state.projectUpdateCount + 1,
		})),
});

export const useMenuStore = create(store);
