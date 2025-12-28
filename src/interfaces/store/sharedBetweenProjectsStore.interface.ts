import { DrawerName } from "@src/enums/components";

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
	sessionsTableSplit: { [projectId: string]: number };
	setSessionsTableWidth: (projectId: string, width: number) => void;
	chatbotWidth: { [projectId: string]: number };
	setChatbotWidth: (projectId: string, width: number) => void;
	projectSettingsWidth: { [projectId: string]: number };
	setProjectSettingsWidth: (projectId: string, width: number) => void;
	eventsDrawerWidth: { [projectId: string]: number };
	setEventsDrawerWidth: (projectId: string, width: number) => void;
	projectFilesWidth: { [projectId: string]: number };
	setProjectFilesWidth: (projectId: string, width: number) => void;
	fullScreenDashboard: boolean;
	setFullScreenDashboard: (value: boolean) => void;
	isProjectFilesVisible: { [projectId: string]: boolean };
	setIsProjectFilesVisible: (projectId: string, value: boolean) => void;
	projectSettingsAccordionState: { [projectId: string]: { [accordionKey: string]: boolean } };
	setProjectSettingsAccordionState: (projectId: string, accordionKey: string, isOpen: boolean) => void;
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
	openDrawer: (projectId: string, drawerName: DrawerName) => void;
	closeDrawer: (projectId: string, drawerName: DrawerName) => void;
	isDrawerOpen: (projectId: string, drawerName: DrawerName) => boolean | undefined;
	setDrawerAnimated: (projectId: string, drawerName: DrawerName, hasAnimated: boolean) => void;
	lastSeenSession: { [projectId: string]: string };
	setLastSeenSession: (projectId: string, sessionId: string) => void;
	settingsPath: { [projectId: string]: string };
	setSettingsPath: (projectId: string, path: string | null) => void;
}
