import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { SharedBetweenProjectsStore } from "@interfaces/store";

const defaultState: Omit<SharedBetweenProjectsStore, "setCursorPosition" | "setFullScreenEditor" | "setEditorWidth"> = {
	cursorPositionPerProject: {},
	fullScreenEditor: {},
	splitScreenRatio: {},
};

const store: StateCreator<SharedBetweenProjectsStore> = (set) => ({
	...defaultState,

	setCursorPosition: (projectId, fileName, cursorPosition) =>
		set((state) => {
			state.cursorPositionPerProject[projectId] = {
				...(state.cursorPositionPerProject[projectId] || {}),
				[fileName]: cursorPosition,
			};

			return state;
		}),

	setFullScreenEditor: (projectId, value) =>
		set((state) => {
			state.fullScreenEditor[projectId] = value;

			return state;
		}),

	setEditorWidth: (projectId, { assets, sessions }) => {
		set(({ splitScreenRatio }) => ({
			splitScreenRatio: {
				...splitScreenRatio,
				[projectId]: {
					assets: assets || splitScreenRatio[projectId]?.assets,
					sessions: sessions || splitScreenRatio[projectId]?.sessions,
				},
			},
		}));
	},
});

export const useSharedBetweenProjectsStore = create(
	persist(immer(store), { name: StoreName.sharedBetweenProjects, version: 2, migrate: () => ({}) })
);
