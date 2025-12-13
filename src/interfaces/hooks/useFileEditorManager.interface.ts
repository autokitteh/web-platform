import type { MutableRefObject } from "react";

import type * as monaco from "monaco-editor";

import type { Project } from "@src/types/models";

export interface UseFileEditorManagerOptions {
	projectId: string;
	activeEditorFileName: string;
	autoSaveMode: boolean;
}

export interface UseFileEditorManagerReturn {
	content: string;
	imageUrl: string | null;
	pdfUrl: string | null;
	lastSaved: string | undefined;
	syncError: boolean;
	grammarLoaded: boolean;
	currentProject: Project | undefined;
	isImageFile: boolean;
	isPdfFile: boolean;
	editorRef: MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>;
	initialContentRef: MutableRefObject<string | Blob>;
	handleEditorMount: (editor: monaco.editor.IStandaloneCodeEditor) => (() => void) | void;
	handleContentChange: (newContent: string) => void;
	debouncedManualSave: () => void;
	debouncedAutosave: (content: string) => void;
	saveFileWithContent: (fileName: string, content: string) => Promise<boolean>;
	setGrammarLoaded: (loaded: boolean) => void;
	setContent: (content: string) => void;
}
