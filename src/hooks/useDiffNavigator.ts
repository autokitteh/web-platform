import { useCallback, useEffect, useRef, useState } from "react";

import * as monaco from "monaco-editor";

interface DiffNavigatorOptions {
	autoJumpToFirstDiff?: boolean;
}

interface DiffNavigatorHookReturn {
	canNavigateNext: boolean;
	canNavigatePrevious: boolean;
	goToNext: () => void;
	goToPrevious: () => void;
	handleEditorMount: (editor: monaco.editor.IStandaloneDiffEditor) => void;
}

export const useDiffNavigator = (options: DiffNavigatorOptions = {}): DiffNavigatorHookReturn => {
	const { autoJumpToFirstDiff = true } = options;

	const editorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
	const [canNavigateNext, setCanNavigateNext] = useState(false);
	const [canNavigatePrevious, setCanNavigatePrevious] = useState(false);
	const [currentChange, setCurrentChange] = useState(0);
	const [totalChanges, setTotalChanges] = useState(0);

	const updateNavigationState = useCallback(() => {
		if (!editorRef.current) return;

		const lineChanges = editorRef.current.getLineChanges();
		const total = lineChanges ? lineChanges.length : 0;
		setTotalChanges(total);
		setCanNavigateNext(currentChange < total - 1);
		setCanNavigatePrevious(currentChange > 0);
	}, [currentChange]);

	const goToChange = useCallback((changeIndex: number) => {
		if (!editorRef.current) return;

		const lineChanges = editorRef.current.getLineChanges();
		if (!lineChanges || changeIndex < 0 || changeIndex >= lineChanges.length) return;

		const change = lineChanges[changeIndex];
		const targetLine = change.modifiedStartLineNumber;

		editorRef.current.revealLineInCenter(targetLine);
		setCurrentChange(changeIndex);
	}, []);

	const handleEditorMount = useCallback(
		(editor: monaco.editor.IStandaloneDiffEditor) => {
			editorRef.current = editor;

			const updateChanges = () => {
				const lineChanges = editor.getLineChanges();
				const total = lineChanges ? lineChanges.length : 0;
				setTotalChanges(total);
				setCanNavigateNext(total > 0);
				setCanNavigatePrevious(false);
				setCurrentChange(0);

				if (autoJumpToFirstDiff && total > 0) {
					setTimeout(() => {
						goToChange(0);
					}, 100);
				}
			};

			editor.onDidUpdateDiff(() => {
				updateChanges();
			});

			updateChanges();
		},
		[autoJumpToFirstDiff, goToChange]
	);

	const goToNext = useCallback(() => {
		if (canNavigateNext) {
			const nextIndex = currentChange + 1;
			goToChange(nextIndex);
			setCurrentChange(nextIndex);
			setCanNavigateNext(nextIndex < totalChanges - 1);
			setCanNavigatePrevious(true);
		}
	}, [currentChange, totalChanges, canNavigateNext, goToChange]);

	const goToPrevious = useCallback(() => {
		if (canNavigatePrevious) {
			const prevIndex = currentChange - 1;
			goToChange(prevIndex);
			setCurrentChange(prevIndex);
			setCanNavigatePrevious(prevIndex > 0);
			setCanNavigateNext(true);
		}
	}, [currentChange, canNavigatePrevious, goToChange]);

	useEffect(() => {
		updateNavigationState();
	}, [updateNavigationState]);

	return {
		canNavigateNext,
		canNavigatePrevious,
		goToNext,
		goToPrevious,
		handleEditorMount,
	};
};
