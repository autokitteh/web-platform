import type { MutableRefObject } from "react";

import type * as monaco from "monaco-editor";

import type { CodeFixSuggestionType } from "@src/types";

export interface UseCodeFixManagerOptions {
	projectId: string;
	activeEditorFileName: string;
	saveFileWithContent: (fileName: string, content: string) => Promise<boolean>;
	setContent: (content: string) => void;
	editorRef: MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>;
	debouncedAutosave: (content: string) => void;
	autoSaveMode: boolean;
}

export interface UseCodeFixManagerReturn {
	codeFixData: CodeFixSuggestionType;
	handleApproveCodeFix: () => Promise<void>;
	handleRejectCodeFix: (sendRejection?: boolean) => void;
}
