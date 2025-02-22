import { EditorCodePosition } from "@src/types/components";

export interface SharedBetweenProjectsStore {
	setCursorPosition: (projectId: string, fileName: string, cursorPosition: EditorCodePosition) => void;
	cursorPositionPerProject: {
		[projectId: string]: {
			[fileName: string]: EditorCodePosition;
		};
	};
}
