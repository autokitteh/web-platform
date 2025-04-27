import { EditorCodePosition } from "@types/components";

export interface SharedBetweenProjectsStore {
	setCursorPosition: (projectId: string, fileName: string, cursorPosition: EditorCodePosition) => void;
	cursorPositionPerProject: {
		[projectId: string]: {
			[fileName: string]: EditorCodePosition;
		};
	};
	fullScreenEditor: { [projectId: string]: boolean };
	setFullScreenEditor: (projectId: string, value: boolean) => void;
	splitScreenRatio: Record<string, { assets: number; sessions: number }>;
	setEditorWidth: (projectId: string, { assets, sessions }: { assets?: number; sessions?: number }) => void;
}
