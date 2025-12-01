import { MutableRefObject } from "react";

import { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

export interface DeleteFileModalData {
	name: string;
	isDirectory?: boolean;
	fileCount?: number;
}

export interface FileTabMenuProps {
	fileName: string;
	isOpen: boolean;
	onClose: () => void;
	position: { x: number; y: number };
	projectId: string;
}

export interface FileContentViewerProps {
	className?: string;
	content: string;
	editorHeight?: string | number;
	fileName: string;
	imageUrl?: string | null;
	initialContentRef?: MutableRefObject<string | Blob>;
	onContentChange?: (content: string) => void;
	onEditorMount?: (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: Monaco) => void;
	onGrammarLoaded?: (loaded: boolean) => void;
	pdfUrl?: string | null;
	projectId?: string;
	showLoadingOverlay?: boolean;
}
