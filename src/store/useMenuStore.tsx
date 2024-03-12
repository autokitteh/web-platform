import { IMenuStore } from "@interfaces/store";
import { StateCreator, create } from "zustand";

const store: StateCreator<IMenuStore> = (set) => ({
	newProjectId: undefined,
	updateNewProjectId: (id: string) =>
		set(() => ({
			newProjectId: id,
		})),
});

export const useMenuStore = create(store);
