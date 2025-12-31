import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { SharedBetweenProjectsStore, EditorSelection } from "@interfaces/store";

const defaultState: Omit<
	SharedBetweenProjectsStore,
	| "setCursorPosition"
	| "setSelection"
	| "setFullScreenDashboard"
	| "setChatbotWidth"
	| "setProjectSettingsWidth"
	| "setEventsDrawerWidth"
	| "setProjectFilesWidth"
	| "setIsProjectFilesVisible"
	| "setProjectSettingsAccordionState"
	| "openDrawer"
	| "closeDrawer"
	| "isDrawerOpen"
	| "setDrawerAnimated"
	| "setLastSeenSession"
	| "setSessionsTableWidth"
	| "setSettingsPath"
> = {
	cursorPositionPerProject: {},
	selectionPerProject: {},
	fullScreenDashboard: false,
	sessionsTableSplit: {},
	chatbotWidth: {},
	projectSettingsWidth: {},
	eventsDrawerWidth: {},
	projectFilesWidth: {},
	isProjectFilesVisible: {},
	projectSettingsAccordionState: {},
	drawers: {},
	drawerAnimated: {},
	lastSeenSession: {},
	settingsPath: {},
};

const store: StateCreator<SharedBetweenProjectsStore> = (set) => ({
	...defaultState,
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

	setSessionsTableWidth: (projectId: string, width: number) =>
		set((state) => {
			state.sessionsTableSplit[projectId] = width;
			return state;
		}),

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

	setEventsDrawerWidth: (projectId: string, width: number) =>
		set((state) => {
			state.eventsDrawerWidth[projectId] = width;
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

			if (state.drawers[projectId][drawerName] === true) {
				return state;
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

			if (state.drawers[projectId][drawerName] === false || state.drawers[projectId][drawerName] === undefined) {
				return state;
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

	setLastSeenSession: (projectId: string, sessionId: string) =>
		set((state) => {
			state.lastSeenSession[projectId] = sessionId;
			return state;
		}),

	setSettingsPath: (projectId: string, path: string | null) =>
		set((state) => {
			if (path === null) {
				delete state.settingsPath[projectId];
			} else {
				state.settingsPath[projectId] = path;
			}
			return state;
		}),
});

export const useSharedBetweenProjectsStore = create(
	persist(immer(store), {
		name: StoreName.sharedBetweenProjects,
		version: 13,
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

			// Version 13: Migrate splitScreenRatio to projectSplitScreenWidth
			if (version < 13 && migratedState) {
				const splitScreenRatio = (migratedState as any).splitScreenRatio;
				const projectSplitScreenWidth: { [key: string]: number } = {};

				if (splitScreenRatio && typeof splitScreenRatio === "object") {
					for (const [projectId, ratio] of Object.entries(splitScreenRatio)) {
						if (ratio && typeof ratio === "object" && "explorer" in ratio) {
							projectSplitScreenWidth[projectId] = (ratio as any).explorer;
						}
					}
				}

				migratedState = {
					...migratedState,
					projectSplitScreenWidth,
				};

				if ((migratedState as any).splitScreenRatio) {
					delete (migratedState as any).splitScreenRatio;
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
