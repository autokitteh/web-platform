export interface SharedBetweenProjectsStore {
	setCursorPosition: (
		projectId: string,
		fileName: string,
		cursorPosition: { column: number; lineNumber: number }
	) => void;
	cursorPositionPerProject: {
		[projectId: string]: {
			[fileName: string]: { column: number; lineNumber: number };
		};
	};
}
