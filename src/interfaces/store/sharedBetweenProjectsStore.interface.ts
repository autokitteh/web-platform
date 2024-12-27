export interface SharedBetweenProjectsStore {
	setCursorPosition: (projectId: string, cursorPositionLine: number) => void;
	cursorPositionPerProject: {
		[projectId: string]: number;
	};
}
