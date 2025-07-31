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
	setExpandedProjectNavigation: (projectId: string, value: boolean) => void;
	splitScreenRatio: Record<string, { assets: number; sessions: number }>;
	setEditorWidth: (projectId: string, { assets, sessions }: { assets?: number; sessions?: number }) => void;
	chatbotWidth: { [projectId: string]: number };
	setChatbotWidth: (projectId: string, width: number) => void;
	fullScreenDashboard: boolean;
	setFullScreenDashboard: (value: boolean) => void;
	isChatbotFullScreen: { [projectId: string]: boolean };
	setIsChatbotFullScreen: (projectId: string, value: boolean) => void;
	isMainContentCollapsed: { [projectId: string]: boolean };
	setIsMainContentCollapsed: (projectId: string, value: boolean) => void;
	isEditorTabsHidden: { [projectId: string]: boolean };
	setIsEditorTabsHidden: (projectId: string, value: boolean) => void;
	isChatbotDrawerOpen: { [projectId: string]: boolean };
	setIsChatbotDrawerOpen: (projectId: string, value: boolean) => void;
	chatbotMode: { [projectId: string]: boolean }; // true = AI Assistant, false = Status Mode
	setChatbotMode: (projectId: string, isAiAssistant: boolean) => void;
}
