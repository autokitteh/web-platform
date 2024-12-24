import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { SharedBetweenProjectsStore } from "@interfaces/store";

const defaultState: Omit<SharedBetweenProjectsStore, "setCursorPosition"> = {
	cursorPositionPerProject: {},
};

const store: StateCreator<SharedBetweenProjectsStore> = (set) => ({
	...defaultState,

	setCursorPosition: (projectId, cursorPosition) => {
		return set((state) => {
			state.cursorPositionPerProject[projectId] = cursorPosition;

			console.log("cursorPositionPerProject", state.cursorPositionPerProject);

			return state;
		});
	},
});

export const useSharedBetweenProjectsStore = create(persist(immer(store), { name: StoreName.sharedBetweenProjects }));
