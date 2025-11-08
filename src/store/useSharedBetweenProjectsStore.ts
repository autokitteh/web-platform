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
	| "setEditorWidth"
	| "setFullScreenDashboard"
	| "setIsChatbotFullScreen"
	| "setIsMainContentCollapsed"
	| "setIsEditorTabsHidden"
	| "setChatbotWidth"
	| "setProjectSettingsWidth"
	| "setProjectFilesWidth"
	| "setIsProjectDrawerState"
	| "setShouldReopenProjectSettingsAfterEvents"
	| "setIsProjectFilesVisible"
	| "setProjectSettingsAccordionState"
	| "setProjectSettingsDrawerOperation"
	| "openDrawer"
	| "closeDrawer"
	| "isDrawerOpen"
	| "setDrawerAnimated"
	| "setDrawerJustOpened"
	| "setLastVisitedUrl"
> = {
	cursorPositionPerProject: {},
	selectionPerProject: {},
	fullScreenEditor: {},
	expandedProjectNavigation: {},
	fullScreenDashboard: false,
	splitScreenRatio: {},
	chatbotWidth: {},
	projectSettingsWidth: {},
	projectFilesWidth: {},
	isChatbotFullScreen: {},
	isMainContentCollapsed: {},
	isEditorTabsHidden: {},
	isProjectDrawerState: {},
	shouldReopenProjectSettingsAfterEvents: {},
	isProjectFilesVisible: {},
	projectSettingsAccordionState: {},
	projectSettingsDrawerOperation: {},
	drawers: {},
	drawerAnimated: {},
	drawerJustOpened: {},
	lastVisitedUrl: {},
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

	setEditorWidth: (projectId, { explorer, sessions }) => {
		set(({ splitScreenRatio }) => ({
			splitScreenRatio: {
				...splitScreenRatio,
				[projectId]: {
					explorer: explorer !== undefined ? explorer : splitScreenRatio[projectId]?.explorer,
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

	setProjectSettingsWidth: (projectId: string, width: number) =>
		set((state) => {
			state.projectSettingsWidth[projectId] = width;
			return state;
		}),

	setProjectFilesWidth: (projectId: string, width: number) =>
		set((state) => {
			state.projectFilesWidth[projectId] = width;
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

	setIsProjectDrawerState: (projectId: string, value?: "ai-assistant" | "configuration") =>
		set((state) => {
			state.isProjectDrawerState[projectId] = value;
			return state;
		}),

	setShouldReopenProjectSettingsAfterEvents: (projectId: string, value: boolean) =>
		set((state) => {
			state.shouldReopenProjectSettingsAfterEvents[projectId] = value;
			return state;
		}),

	setIsProjectFilesVisible: (projectId: string, value: boolean) =>
		set((state) => {
			state.isProjectFilesVisible[projectId] = value;
			return state;
		}),

	setProjectSettingsAccordionState: (projectId: string, accordionKey: string, isOpen: boolean) =>
		set((state) => {
			if (!state.projectSettingsAccordionState[projectId]) {
				state.projectSettingsAccordionState[projectId] = {};
			}
			state.projectSettingsAccordionState[projectId][accordionKey] = isOpen;
			return state;
		}),

	setProjectSettingsDrawerOperation: (
		projectId: string,
		operation: {
			action: "add" | "edit" | "delete";
			id?: string;
			type: "connection" | "variable" | "trigger";
		} | null
	) =>
		set((state) => {
			state.projectSettingsDrawerOperation[projectId] = operation;
			return state;
		}),

	openDrawer: (projectId: string, drawerName: string) =>
		set((state) => {
			if (!state.drawers[projectId]) {
				state.drawers[projectId] = {};
			}
			const wasOpen = state.drawers[projectId][drawerName];
			state.drawers[projectId][drawerName] = true;

			if (!wasOpen) {
				if (!state.drawerJustOpened[projectId]) {
					state.drawerJustOpened[projectId] = {};
				}
				state.drawerJustOpened[projectId][drawerName] = true;
			}
			return state;
		}),

	closeDrawer: (projectId: string, drawerName: string) =>
		set((state) => {
			if (!state.drawers[projectId]) {
				state.drawers[projectId] = {};
			}
			state.drawers[projectId][drawerName] = false;

			if (state.drawerJustOpened[projectId]) {
				state.drawerJustOpened[projectId][drawerName] = false;
			}
			return state;
		}),

	isDrawerOpen: (projectId: string, drawerName: string) => {
		const state = useSharedBetweenProjectsStore.getState();
		return state.drawers[projectId]?.[drawerName];
	},

	setDrawerAnimated: (projectId: string, drawerName: string, hasAnimated: boolean) =>
		set((state) => {
			if (!state.drawerAnimated[projectId]) {
				state.drawerAnimated[projectId] = {};
			}
			state.drawerAnimated[projectId][drawerName] = hasAnimated;
			return state;
		}),

	setDrawerJustOpened: (projectId: string, drawerName: string, justOpened: boolean) =>
		set((state) => {
			if (!state.drawerJustOpened[projectId]) {
				state.drawerJustOpened[projectId] = {};
			}
			state.drawerJustOpened[projectId][drawerName] = justOpened;
			return state;
		}),

	setLastVisitedUrl: (projectId: string, url: string) =>
		set((state) => {
			state.lastVisitedUrl[projectId] = url;
			return state;
		}),
});

export const useSharedBetweenProjectsStore = create(
	persist(immer(store), {
		name: StoreName.sharedBetweenProjects,
		version: 10,
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

			if (version < 5 && migratedState && (migratedState as any).chatbotWidth) {
				const chatbotWidth = (migratedState as any).chatbotWidth;
				const migratedChatbotWidth: { [key: string]: number } = {};

				for (const [projectId, width] of Object.entries(chatbotWidth)) {
					if (typeof width === "number" && width === 35) {
						migratedChatbotWidth[projectId] = 55;
					} else {
						migratedChatbotWidth[projectId] = width as number;
					}
				}

				migratedState = {
					...migratedState,
					chatbotWidth: migratedChatbotWidth,
				};
			}

			// Version 6: Migrate isChatbotDrawerOpen to isProjectDrawerState and remove chatbotHelperConfigMode
			if (version < 6 && migratedState) {
				// Migrate isChatbotDrawerOpen to isProjectDrawerState
				if ((migratedState as any).isChatbotDrawerOpen) {
					const oldDrawerState = (migratedState as any).isChatbotDrawerOpen;
					const newDrawerState: { [key: string]: "ai-assistant" | "configuration" | undefined } = {};

					for (const [projectId, isOpen] of Object.entries(oldDrawerState)) {
						newDrawerState[projectId] = isOpen ? "ai-assistant" : undefined;
					}

					migratedState = {
						...migratedState,
						isProjectDrawerState: newDrawerState,
					};
					delete (migratedState as any).isChatbotDrawerOpen;
				}

				// Remove deprecated chatbotHelperConfigMode
				if ((migratedState as any).chatbotHelperConfigMode) {
					delete (migratedState as any).chatbotHelperConfigMode;
				}
			}

			// Version 8: Initialize drawers object if it doesn't exist
			if (version < 8 && migratedState) {
				if (!(migratedState as any).drawers) {
					migratedState = {
						...migratedState,
						drawers: {},
					};
				}
			}

			// Version 9: Initialize drawerAnimated object if it doesn't exist
			if (version < 9 && migratedState) {
				if (!(migratedState as any).drawerAnimated) {
					migratedState = {
						...migratedState,
						drawerAnimated: {},
					};
				}
			}

			// Version 10: Initialize drawerJustOpened object if it doesn't exist
			if (version < 10 && migratedState) {
				if (!(migratedState as any).drawerJustOpened) {
					migratedState = {
						...migratedState,
						drawerJustOpened: {},
					};
				}
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
