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
	splitScreenRatio: Record<string, { assets: number; sessions: number }>;
	setEditorWidth: (projectId: string, { assets, sessions }: { assets?: number; sessions?: number }) => void;
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
			action: "add" | "edit" | "delete";
			id?: string;
			type: "connection" | "variable" | "trigger";
		} | null;
	};
	setProjectSettingsDrawerOperation: (
		projectId: string,
		operation: {
			action: "add" | "edit" | "delete";
			id?: string;
			type: "connection" | "variable" | "trigger";
		} | null
	) => void;
	drawers: {
		[projectId: string]: {
			[drawerName: string]: boolean;
		};
	};
	openDrawer: (projectId: string, drawerName: string) => void;
	closeDrawer: (projectId: string, drawerName: string) => void;
	isDrawerOpen: (projectId: string, drawerName: string) => boolean;
}
