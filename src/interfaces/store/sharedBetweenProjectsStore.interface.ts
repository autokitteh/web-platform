export interface SharedBetweenProjectsStore {
	setCursorPosition: (projectId: string, cursorPosition: { column: number; lineNumber: number }) => void;
	cursorPositionPerProject: {
		[projectId: string]: {
			column: number;
			lineNumber: number;
		};
	};
}
