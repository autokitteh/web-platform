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
	| "setChatbotWidth"
	| "setProjectSettingsWidth"
	| "setProjectFilesWidth"
	| "setShouldReopenProjectSettingsAfterEvents"
	| "setIsProjectFilesVisible"
	| "setProjectSettingsAccordionState"
	| "openDrawer"
	| "closeDrawer"
	| "isDrawerOpen"
	| "setDrawerAnimated"
	| "setLastVisitedUrl"
	| "setLastSeenSession"
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
	shouldReopenProjectSettingsAfterEvents: {},
	isProjectFilesVisible: {},
	projectSettingsAccordionState: {},
	drawers: {},
	drawerAnimated: {},
	lastVisitedUrl: {},
	lastSeenSession: {},
};

const store: StateCreator<SharedBetweenProjectsStore> = (set) => ({
	...defaultState,
	setIsChatbotFullScreen: (projectId: string, value: boolean) =>
		set((state) => {
			state.isChatbotFullScreen[projectId] = value;
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

	openDrawer: (projectId: string, drawerName: string) =>
		set((state) => {
			if (!state.drawers[projectId]) {
				state.drawers[projectId] = {};
			}

			for (const existingDrawerName in state.drawers[projectId]) {
				if (existingDrawerName !== drawerName) {
					state.drawers[projectId][existingDrawerName] = false;
				}
			}

			state.drawers[projectId][drawerName] = true;

			return state;
		}),

	closeDrawer: (projectId: string, drawerName: string) =>
		set((state) => {
			if (!state.drawers[projectId]) {
				state.drawers[projectId] = {};
			}
			state.drawers[projectId][drawerName] = false;

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

	setLastVisitedUrl: (projectId: string, url: string) =>
		set((state) => {
			state.lastVisitedUrl[projectId] = url;
			return state;
		}),

	setLastSeenSession: (projectId: string, sessionId: string) =>
		set((state) => {
			state.lastSeenSession[projectId] = sessionId;
			return state;
		}),
});

export const useSharedBetweenProjectsStore = create(
	persist(immer(store), {
		name: StoreName.sharedBetweenProjects,
		version: 12,
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

			// Version 6: Remove deprecated properties
			if (version < 6 && migratedState) {
				// Remove deprecated isChatbotDrawerOpen
				if ((migratedState as any).isChatbotDrawerOpen) {
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

			// Version 12: Remove deprecated properties
			if (version < 12 && migratedState) {
				const deprecatedProps = [
					"drawerHistory",
					"drawersZindex",
					"nextZIndex",
					"drawerJustOpened",
					"isProjectDrawerState",
					"isEditorTabsHidden",
					"isMainContentCollapsed",
					"projectSettingsDrawerOperation",
				];

				deprecatedProps.forEach((prop) => {
					if ((migratedState as any)[prop]) {
						delete (migratedState as any)[prop];
					}
				});
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
