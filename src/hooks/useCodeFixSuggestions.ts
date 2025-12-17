import { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";

import { defaultCodeFixSuggestion, namespaces } from "@constants";
import { UseCodeFixSuggestionsOptions } from "@interfaces/hooks";
import { LoggerService } from "@services";
import { ModalName } from "@src/enums";
import { CodeFixSuggestionType } from "@src/types";
import { buildCodeFixData } from "@utilities/codeFixData.utility";

import { useModalStore, useCacheStore } from "@store";

export const useCodeFixSuggestions = ({ activeEditorFileName }: UseCodeFixSuggestionsOptions) => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const [codeFixData, setCodeFixData] = useState<CodeFixSuggestionType>(defaultCodeFixSuggestion);
	const { openModal, closeModal } = useModalStore();
	const { resources } = useCacheStore();

	const handleCodeFixEvent = useCallback(
		(eventDetail: { changeType?: string; fileName?: string; newCode?: string }) => {
			const { changeType = "modify", fileName: filename, newCode = "" } = eventDetail;
			const targetFileName = filename || activeEditorFileName;

			if (!targetFileName) {
				LoggerService.warn(namespaces.ui.projectCodeEditor, tErrors("cannotApplyCodeFixNoFile"));
				return;
			}

			const fileResource = resources?.[targetFileName];

			if (!fileResource && changeType === "modify") {
				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					tErrors("codeFixCacheResourceMissing", { fileName: targetFileName }),
					true
				);
			}

			const fixData = buildCodeFixData(targetFileName, newCode, changeType, fileResource, {
				t,
			});
			setCodeFixData(fixData);
			openModal(ModalName.codeFixDiffEditor);
		},
		[activeEditorFileName, tErrors, t, resources, openModal]
	);

	const handleApproveCodeFix = useCallback(() => {
		closeModal(ModalName.codeFixDiffEditor);
		setCodeFixData(defaultCodeFixSuggestion);
	}, [closeModal]);

	const handleRejectCodeFix = useCallback(() => {
		closeModal(ModalName.codeFixDiffEditor);
		setCodeFixData(defaultCodeFixSuggestion);
	}, [closeModal]);

	return {
		codeFixData,
		setCodeFixData,
		handleCodeFixEvent,
		handleApproveCodeFix,
		handleRejectCodeFix,
		isCodeFixModalOpen: codeFixData.fileName !== "",
	};
};
