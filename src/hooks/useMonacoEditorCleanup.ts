import { useEffect, useRef } from "react";

import * as monaco from "monaco-editor";

import { namespaces } from "@constants";
import { LoggerService } from "@services";

export const useMonacoEditorCleanup = () => {
	const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
	const regularEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

	const disposeDiffEditor = () => {
		if (diffEditorRef.current) {
			try {
				diffEditorRef.current.dispose();
			} catch (error) {
				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					`Error disposing diff editor: ${(error as Error).message}`,
					true
				);
			}
			diffEditorRef.current = null;
		}
	};

	const disposeRegularEditor = () => {
		if (regularEditorRef.current) {
			try {
				regularEditorRef.current.dispose();
			} catch (error) {
				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					`Error disposing regular editor: ${(error as Error).message}`,
					true
				);
			}
			regularEditorRef.current = null;
		}
	};

	const disposeAllEditors = () => {
		disposeDiffEditor();
		disposeRegularEditor();
	};

	useEffect(() => {
		return () => {
			disposeAllEditors();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		diffEditorRef,
		regularEditorRef,
		disposeDiffEditor,
		disposeRegularEditor,
		disposeAllEditors,
	};
};
