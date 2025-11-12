import { Entity, EntityAction } from "@src/types";

export interface EditorSelection {
	startLine: number;
	startColumn: number;
	endLine?: number;
	endColumn?: number;
	code: string;
	filename: string;
}

export interface SharedBetweenProjectsStore {
	setCursorPosition: (projectId: string, fileName: string, cursorPosition: EditorSelection) => void;
	cursorPositionPerProject: {
		[projectId: string]: {
			[fileName: string]: EditorSelection;
		};
	};
	setSelection: (projectId: string, fileName: string, selection: EditorSelection) => void;
	selectionPerProject: {
		[projectId: string]: EditorSelection;
	};
	fullScreenEditor: { [projectId: string]: boolean };
	setFullScreenEditor: (projectId: string, value: boolean) => void;
	expandedProjectNavigation: { [projectId: string]: boolean };
	splitScreenRatio: Record<string, { explorer: number; sessions: number }>;
	setEditorWidth: (projectId: string, { explorer, sessions }: { explorer?: number; sessions?: number }) => void;
	chatbotWidth: { [projectId: string]: number };
	setChatbotWidth: (projectId: string, width: number) => void;
	projectSettingsWidth: { [projectId: string]: number };
	setProjectSettingsWidth: (projectId: string, width: number) => void;
	projectFilesWidth: { [projectId: string]: number };
	setProjectFilesWidth: (projectId: string, width: number) => void;
	fullScreenDashboard: boolean;
	setFullScreenDashboard: (value: boolean) => void;
	isChatbotFullScreen: { [projectId: string]: boolean };
	setIsChatbotFullScreen: (projectId: string, value: boolean) => void;
	isMainContentCollapsed: { [projectId: string]: boolean };
	setIsMainContentCollapsed: (projectId: string, value: boolean) => void;
	isEditorTabsHidden: { [projectId: string]: boolean };
	setIsEditorTabsHidden: (projectId: string, value: boolean) => void;
	isProjectDrawerState: { [projectId: string]: "ai-assistant" | "configuration" | undefined };
	setIsProjectDrawerState: (projectId: string, value?: "ai-assistant" | "configuration") => void;
	shouldReopenProjectSettingsAfterEvents: { [projectId: string]: boolean };
	setShouldReopenProjectSettingsAfterEvents: (projectId: string, value: boolean) => void;
	isProjectFilesVisible: { [projectId: string]: boolean };
	setIsProjectFilesVisible: (projectId: string, value: boolean) => void;
	projectSettingsAccordionState: { [projectId: string]: { [accordionKey: string]: boolean } };
	setProjectSettingsAccordionState: (projectId: string, accordionKey: string, isOpen: boolean) => void;
	projectSettingsDrawerOperation: {
		[projectId: string]: {
			action: EntityAction;
			id?: string;
			type: Entity;
		} | null;
	};
	setProjectSettingsDrawerOperation: (
		projectId: string,
		operation: {
			action: EntityAction;
			id?: string;
			type: Entity;
		} | null
	) => void;
	drawers: {
		[projectId: string]: {
			[drawerName: string]: boolean;
		};
	};
	drawerAnimated: {
		[projectId: string]: {
			[drawerName: string]: boolean;
		};
	};
	drawerJustOpened: {
		[projectId: string]: {
			[drawerName: string]: boolean;
		};
	};
	drawersZindex: {
		[projectId: string]: {
			[drawerName: string]: number;
		};
	};
	nextZIndex: number;
	drawerHistory: {
		[projectId: string]: string[];
	};
	openDrawer: (projectId: string, drawerName: string) => void;
	closeDrawer: (projectId: string, drawerName: string) => void;
	isDrawerOpen: (projectId: string, drawerName: string) => boolean | undefined;
	getDrawerZindex: (projectId: string, drawerName: string) => number | undefined;
	setDrawerAnimated: (projectId: string, drawerName: string, hasAnimated: boolean) => void;
	setDrawerJustOpened: (projectId: string, drawerName: string, justOpened: boolean) => void;
	lastVisitedUrl: { [projectId: string]: string };
	setLastVisitedUrl: (projectId: string, url: string) => void;
	lastSeenSession: { [projectId: string]: string };
	setLastSeenSession: (projectId: string, sessionId: string) => void;
}
