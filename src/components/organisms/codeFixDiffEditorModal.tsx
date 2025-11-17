import React, { useCallback, useEffect, useRef } from "react";

import type { Monaco } from "@monaco-editor/react";
import { DiffEditor, Editor } from "@monaco-editor/react";
import type { TFunction } from "i18next";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";

import { namespaces } from "@constants";
import { useDiffNavigator } from "@hooks/useDiffNavigator";
import { CodeFixDiffEditorProps } from "@interfaces/components";
import { LoggerService } from "@services";
import { ModalName } from "@src/enums";
import type { OperationType } from "@src/types";

import { Button, Typography, CodeFixMessage, DeleteFileConfirmation } from "@components/atoms";
import { Modal, DiffNavigationToolbar } from "@components/molecules";

const getCodeFixModalTitle = (changeType: OperationType, fileName: string | undefined, t: TFunction): string => {
	if (changeType === "add") {
		return fileName ? t("codeFixModal.createNewFileWithName", { fileName }) : t("codeFixModal.createNewFile");
	}
	if (changeType === "remove") {
		return fileName ? t("codeFixModal.deleteFileWithName", { fileName }) : t("codeFixModal.deleteFile");
	}
	return t("codeFixModal.reviewChanges");
};

const getCodeFixModalActionLabels = (changeType: OperationType, t: TFunction) => {
	const rejectLabel = changeType === "remove" ? t("codeFixModal.cancel") : t("codeFixModal.reject");
	const approveLabel =
		changeType === "add"
			? t("codeFixModal.createFile")
			: changeType === "remove"
				? t("codeFixModal.deleteFileAction")
				: t("codeFixModal.applyChanges");

	return {
		reject: rejectLabel,
		approve: approveLabel,
	};
};

export const CodeFixDiffEditorModal = ({ onApprove, onReject, ...codeFixSuggestion }: CodeFixDiffEditorProps) => {
	const { fileName, modifiedCode, originalCode, changeType, warningMessage, errorMessage } = codeFixSuggestion;
	const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
	const regularEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

	const { canNavigateNext, canNavigatePrevious, goToNext, goToPrevious, handleEditorMount } = useDiffNavigator({
		autoJumpToFirstDiff: true,
	});

	const handleEditorWillMount = useCallback((monaco: Monaco) => {
		monaco.editor.defineTheme("codeFixDiffTheme", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#000000",
				"diffEditor.insertedTextBackground": "#00ff0020",
				"diffEditor.removedTextBackground": "#ff000020",
				"diffEditor.insertedLineBackground": "#00ff0010",
				"diffEditor.removedLineBackground": "#ff000010",
			},
		});
	}, []);

	const handleEditorDidMount = useCallback(
		(editor: monaco.editor.IStandaloneDiffEditor) => {
			diffEditorRef.current = editor;
			editor.focus();
			handleEditorMount(editor);
		},
		[handleEditorMount]
	);

	const handleRegularEditorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
		regularEditorRef.current = editor;
		editor.focus();
	}, []);

	useEffect(() => {
		return () => {
			if (diffEditorRef.current) {
				try {
					const diffModel = diffEditorRef.current.getModel();
					if (diffModel) {
						diffModel.original?.dispose();
						diffModel.modified?.dispose();
					}
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
	}, []);

	useEffect(() => {
		if (changeType !== "modify" && diffEditorRef.current) {
			try {
				const diffModel = diffEditorRef.current.getModel();
				if (diffModel) {
					diffModel.original?.dispose();
					diffModel.modified?.dispose();
				}
				diffEditorRef.current.dispose();
			} catch (error) {
				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					`Error disposing diff editor on changeType change: ${(error as Error).message}`,
					true
				);
			}
			diffEditorRef.current = null;
		}

		if (changeType !== "add" && regularEditorRef.current) {
			try {
				regularEditorRef.current.dispose();
			} catch (error) {
				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					`Error disposing regular editor on changeType change: ${(error as Error).message}`,
					true
				);
			}
			regularEditorRef.current = null;
		}
	}, [changeType]);

	const handleApprove = useCallback(() => {
		onApprove();
	}, [onApprove]);

	const handleReject = useCallback(() => {
		onReject();
	}, [onReject]);

	const { t } = useTranslation("chatbot");

	const title = getCodeFixModalTitle(changeType, fileName, t);
	const { reject: rejectLabel, approve: approveLabel } = getCodeFixModalActionLabels(changeType, t);

	return (
		<Modal
			className="h-[90vh] max-h-[90vh] min-h-[600px] w-full max-w-6xl bg-gray-900 text-white"
			name={ModalName.codeFixDiffEditor}
		>
			<div className="mb-4 flex items-center justify-center">
				<Typography className="text-white" variant="h3">
					{title}
				</Typography>
			</div>

			<div className="flex h-[calc(100%-80px)] flex-col">
				<CodeFixMessage errorMessage={errorMessage} warningMessage={warningMessage} />
				<div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-700">
					{changeType === "modify" ? (
						<div className="absolute right-2 top-2 z-10">
							<DiffNavigationToolbar
								canNavigateNext={canNavigateNext}
								canNavigatePrevious={canNavigatePrevious}
								onNext={goToNext}
								onPrevious={goToPrevious}
							/>
						</div>
					) : null}
					{changeType === "remove" ? (
						<DeleteFileConfirmation fileName={fileName} />
					) : changeType === "add" ? (
						<Editor
							beforeMount={handleEditorWillMount}
							height="100%"
							language="python"
							loading={
								<div className="flex h-full items-center justify-center">
									<Typography className="text-gray-400" variant="body2">
										Loading code editor...
									</Typography>
								</div>
							}
							onMount={handleRegularEditorDidMount}
							options={{
								fontFamily: "monospace, sans-serif",
								fontSize: 14,
								minimap: {
									enabled: false,
								},
								readOnly: true,
								renderLineHighlight: "none",
								scrollBeyondLastLine: false,
								wordWrap: "on",
							}}
							theme="vs-dark"
							value={modifiedCode}
						/>
					) : (
						<DiffEditor
							beforeMount={handleEditorWillMount}
							height="100%"
							language="python"
							loading={
								<div className="flex h-full items-center justify-center">
									<Typography className="text-gray-400" variant="body2">
										Loading diff editor...
									</Typography>
								</div>
							}
							modified={modifiedCode}
							modifiedLanguage="python"
							onMount={handleEditorDidMount}
							options={{
								fontFamily: "monospace, sans-serif",
								fontSize: 14,
								minimap: {
									enabled: false,
								},
								readOnly: true,
								renderLineHighlight: "none",
								scrollBeyondLastLine: false,
								wordWrap: "on",
							}}
							original={originalCode}
							originalLanguage="python"
							theme="vs-dark"
						/>
					)}
				</div>

				<div className="mt-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Typography className="text-gray-400" variant="body2">
							{changeType === "add"
								? t("codeFixModal.reviewNewFileContent")
								: changeType === "remove"
									? t("codeFixModal.confirmFileDeletion")
									: t("codeFixModal.reviewChanges")}
						</Typography>
					</div>

					<div className="flex items-center gap-3">
						<Button className="px-6 text-white" onClick={handleReject} variant="outline">
							{rejectLabel}
						</Button>
						<Button className="px-6" onClick={handleApprove} variant="filled">
							{approveLabel}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};
