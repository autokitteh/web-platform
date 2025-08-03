import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { SharedBetweenProjectsStore, EditorSelection } from "@interfaces/store";

const defaultState: Omit<
	SharedBetweenProjectsStore,
	| "setCursorPosition"
	| "setSelection"
	| "setFullScreenEditor"
	| "setExpandedProjectNavigation"
	| "setEditorWidth"
	| "setFullScreenDashboard"
	| "setIsChatbotFullScreen"
	| "setIsMainContentCollapsed"
	| "setIsEditorTabsHidden"
	| "setChatbotWidth"
	| "setIsChatbotDrawerOpen"
	| "setChatbotHelperConfigMode"
> = {
	cursorPositionPerProject: {},
	selectionPerProject: {},
	fullScreenEditor: {},
	expandedProjectNavigation: {},
	fullScreenDashboard: false,
	splitScreenRatio: {},
	chatbotWidth: {},
	isChatbotFullScreen: {},
	isMainContentCollapsed: {},
	isEditorTabsHidden: {},
	isChatbotDrawerOpen: {},
	chatbotHelperConfigMode: {},
};

const store: StateCreator<SharedBetweenProjectsStore> = (set) => ({
	...defaultState,
	setIsChatbotFullScreen: (projectId: string, value: boolean) =>
		set((state) => {
			state.isChatbotFullScreen[projectId] = value;
			return state;
		}),

	setIsMainContentCollapsed: (projectId: string, value: boolean) =>
		set((state) => {
			state.isMainContentCollapsed[projectId] = value;
			return state;
		}),

	setCursorPosition: (projectId: string, fileName: string, cursorPosition: EditorSelection) =>
		set((state) => {
			state.cursorPositionPerProject[projectId] = {
				...(state.cursorPositionPerProject[projectId] || {}),
				[fileName]: cursorPosition,
			};

			return state;
		}),

	setSelection: (projectId, fileName, selection) =>
		set((state) => {
			state.selectionPerProject[projectId] = {
				...(state.selectionPerProject[projectId] || {}),
				[fileName]: selection,
			};

			return state;
		}),

	setFullScreenEditor: (projectId, value) =>
		set((state) => {
			state.fullScreenEditor[projectId] = value;

			return state;
		}),

	setExpandedProjectNavigation: (projectId, value) =>
		set((state) => {
			state.expandedProjectNavigation[projectId] = value;

			return state;
		}),

	setEditorWidth: (projectId, { assets, sessions }) => {
		set(({ splitScreenRatio }) => ({
			splitScreenRatio: {
				...splitScreenRatio,
				[projectId]: {
					assets: assets !== undefined ? assets : splitScreenRatio[projectId]?.assets,
					sessions: sessions !== undefined ? sessions : splitScreenRatio[projectId]?.sessions,
				},
			},
		}));
	},

	setChatbotWidth: (projectId: string, width: number) =>
		set((state) => {
			state.chatbotWidth[projectId] = width;
			return state;
		}),

	setFullScreenDashboard: (value) =>
		set((state) => {
			state.fullScreenDashboard = value;

			return state;
		}),

	setIsEditorTabsHidden: (projectId: string, value: boolean) =>
		set((state) => {
			state.isEditorTabsHidden[projectId] = value;
			return state;
		}),

	setIsChatbotDrawerOpen: (projectId: string, value: boolean) =>
		set((state) => {
			state.isChatbotDrawerOpen[projectId] = value;
			return state;
		}),

	setChatbotHelperConfigMode: (projectId: string, isAiAssistant: boolean) =>
		set((state) => {
			state.chatbotHelperConfigMode[projectId] = isAiAssistant;
			return state;
		}),
});

export const useSharedBetweenProjectsStore = create(
	persist(immer(store), {
		name: StoreName.sharedBetweenProjects,
		version: 4,
		migrate: (persistedState, version) => {
			let migratedState = persistedState;

			if (
				migratedState &&
				Object.prototype.hasOwnProperty.call(migratedState, "isChatbotOpen") &&
				typeof (migratedState as any).isChatbotOpen === "boolean"
			) {
				migratedState = {
					...migratedState,
					isChatbotOpen: {},
				};
			}

			if (version < 4 && migratedState && (migratedState as any).chatbotWidth) {
				const chatbotWidth = (migratedState as any).chatbotWidth;
				const migratedChatbotWidth: { [key: string]: number } = {};

				for (const [projectId, pixelWidth] of Object.entries(chatbotWidth)) {
					if (typeof pixelWidth === "number" && pixelWidth > 100) {
						migratedChatbotWidth[projectId] = 30;
					} else {
						migratedChatbotWidth[projectId] = pixelWidth as number;
					}
				}

				migratedState = {
					...migratedState,
					chatbotWidth: migratedChatbotWidth,
				};
			}

			return migratedState;
		},
		partialize: (state) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { fullScreenDashboard, ...rest } = state;
			return rest;
		},
	})
);
