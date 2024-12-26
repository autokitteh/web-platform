export interface SharedBetweenProjectsStore {
	setCursorPosition: (projectId: string, cursorPosition: { column: number; lineNumber: number }) => void;
	setCurrentProjectId: (projectId: string) => void;
	currentProjectId: string;
	cursorPositionPerProject: {
		[projectId: string]: {
			column: number;
			lineNumber: number;
		};
	};
}
