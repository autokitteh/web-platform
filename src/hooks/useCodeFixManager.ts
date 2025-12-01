import { useCallback, useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";

import { useCodeFixSuggestions } from "./useCodeFixSuggestions";
import { defaultCodeFixSuggestion } from "../constants/monacoEditor.constants";
import { namespaces } from "@constants";
import { UseCodeFixManagerOptions, UseCodeFixManagerReturn } from "@interfaces/hooks";
import { LoggerService, iframeCommService } from "@services";
import { EventListenerName, ModalName } from "@src/enums";
import { fileOperations } from "@src/factories";
import { useEventListener } from "@src/hooks/useEventListener";
import { useCodeFixStore, useFileStore, useModalStore, useToastStore } from "@src/store";
import { generateBulkCodeFixSummary, processBulkCodeFixSuggestions } from "@utilities";

export const useCodeFixManager = ({
	projectId,
	activeEditorFileName,
	saveFileWithContent,
	setContent,
	editorRef,
	debouncedAutosave,
	autoSaveMode,
}: UseCodeFixManagerOptions): UseCodeFixManagerReturn => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });

	const addToast = useToastStore((state) => state.addToast);
	const { closeModal } = useModalStore();
	const { openFileAsActive } = useFileStore();
	const { setCodeFixData: setCodeFixDataInStore, setHandlers } = useCodeFixStore();

	const { codeFixData, setCodeFixData, handleCodeFixEvent } = useCodeFixSuggestions({
		activeEditorFileName,
	});

	const handleRejectCodeFix = useCallback(
		(sendRejection = true) => {
			if (codeFixData && sendRejection) {
				try {
					if (codeFixData.changeType === "add") {
						iframeCommService.safeSendEvent("CODE_ADD_REJECTED", { fileName: codeFixData.fileName });
					} else if (codeFixData.changeType === "remove") {
						iframeCommService.safeSendEvent("CODE_DELETE_REJECTED", { fileName: codeFixData.fileName });
					} else if (codeFixData.changeType === "modify") {
						iframeCommService.safeSendEvent("CODE_SUGGESTION_REJECTED", { fileName: codeFixData.fileName });
					}

					iframeCommService.sendCodeSuggestionRejected(
						codeFixData.fileName,
						codeFixData.changeType,
						undefined,
						"User rejected the suggestion"
					);
				} catch (error) {
					LoggerService.error(
						namespaces.ui.projectCodeEditor,
						tErrors("rejectionMessageFailed", { error: (error as Error).message })
					);
				}
			}

			setCodeFixData(defaultCodeFixSuggestion);
			closeModal(ModalName.codeFixDiffEditor);
		},
		[codeFixData, setCodeFixData, closeModal, tErrors]
	);

	const handleApproveCodeFix = useCallback(async () => {
		if (!codeFixData) return;

		const { modifiedCode, fileName, changeType } = codeFixData;
		const { saveFile: saveFileOp, deleteFile } = fileOperations(projectId);

		try {
			switch (changeType) {
				case "modify": {
					const fileSaved = await saveFileOp(fileName, modifiedCode);
					if (!fileSaved) {
						addToast({
							message: t("fileSaveFailedModified", { fileName }),
							type: "error",
						});
						return;
					}

					if (fileName === activeEditorFileName && editorRef.current) {
						const model = editorRef.current.getModel();
						if (model) {
							setContent(modifiedCode);
							model.setValue(modifiedCode);
						}
					}

					if (autoSaveMode && activeEditorFileName === fileName) {
						debouncedAutosave(modifiedCode);
					}
					break;
				}
				case "add": {
					const fileSaved = await saveFileOp(fileName, modifiedCode);
					if (fileSaved) {
						addToast({
							message: t("fileCreatedSuccess", { fileName }),
							type: "success",
						});
						openFileAsActive(fileName);
					} else {
						addToast({
							message: t("fileCreateFailed", { fileName }),
							type: "error",
						});
						return;
					}
					break;
				}
				case "remove": {
					await deleteFile(fileName);
					addToast({
						message: t("fileDeletedSuccess", { fileName }),
						type: "success",
					});
					break;
				}
				default:
					LoggerService.warn(namespaces.ui.projectCodeEditor, `Unknown change type: ${changeType}`);
					return;
			}
		} catch (error) {
			addToast({
				message: t("operationFailed", { changeType, error: (error as Error).message }),
				type: "error",
			});
			LoggerService.error(
				namespaces.ui.projectCodeEditor,
				t("operationFailed", { changeType, error: (error as Error).message })
			);
			return;
		}

		try {
			iframeCommService.sendCodeSuggestionAccepted(fileName, changeType, undefined);
		} catch (error) {
			LoggerService.error(
				namespaces.ui.projectCodeEditor,
				tErrors("acceptanceMessageFailed", { error: (error as Error).message })
			);
		}

		handleRejectCodeFix(false);

		addToast({
			message: t("codeFixAppliedSuccess"),
			type: "success",
		});
	}, [
		codeFixData,
		projectId,
		activeEditorFileName,
		autoSaveMode,
		editorRef,
		setContent,
		debouncedAutosave,
		openFileAsActive,
		addToast,
		t,
		tErrors,
		handleRejectCodeFix,
	]);

	const approveRef = useRef(handleApproveCodeFix);
	const rejectRef = useRef(handleRejectCodeFix);

	useEffect(() => {
		approveRef.current = handleApproveCodeFix;
		rejectRef.current = handleRejectCodeFix;
	});

	useEffect(() => {
		setCodeFixDataInStore(codeFixData);
	}, [codeFixData, setCodeFixDataInStore]);

	useEffect(() => {
		setHandlers(
			() => approveRef.current(),
			(sendRejection?: boolean) => rejectRef.current(sendRejection)
		);
	}, [setHandlers]);

	useEventListener(EventListenerName.codeFixSuggestion, (event: CustomEvent) => {
		handleCodeFixEvent(event.detail);
	});

	useEventListener(EventListenerName.codeFixSuggestionAdd, (event: CustomEvent) => {
		handleCodeFixEvent(event.detail);
	});

	useEventListener(EventListenerName.codeFixSuggestionRemove, (event: CustomEvent) => {
		handleCodeFixEvent(event.detail);
	});

	useEventListener(EventListenerName.codeFixSuggestionAll, async (event: CustomEvent) => {
		const { suggestions } = event.detail as { suggestions: Array<{ fileName: string; newCode: string }> };

		const result = await processBulkCodeFixSuggestions(suggestions, {
			tErrors,
			onProcessFile: saveFileWithContent,
			onActiveFileUpdate: (fileName: string, newCode: string) => {
				if (fileName === activeEditorFileName && editorRef.current) {
					const model = editorRef.current.getModel();
					if (model) {
						setContent(newCode);
						model.setValue(newCode);
					}
				}
			},
		});

		const summary = generateBulkCodeFixSummary(result, tErrors);
		if (summary.message) {
			addToast({
				message: summary.message,
				type: summary.success ? "success" : "warning",
			});
		}
	});

	return {
		codeFixData,
		handleApproveCodeFix,
		handleRejectCodeFix,
	};
};
