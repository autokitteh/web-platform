import { TFunction } from "i18next";

import { defaultSuggestionAction } from "@constants";
import { CodeFixSuggestionType, OperationType } from "@src/types";

interface TranslationFunctions {
	t: TFunction;
}

export const buildCodeFixData = (
	targetFileName: string,
	newCode: string,
	changeType: string,
	fileResource: Uint8Array | undefined,
	{ t }: TranslationFunctions
): CodeFixSuggestionType => {
	if (!fileResource && changeType === "modify") {
		return {
			originalCode: "",
			modifiedCode: newCode,
			fileName: targetFileName,
			changeType: defaultSuggestionAction,
			warningMessage: t("codeFixOriginalFileMissing", { fileName: targetFileName }),
			errorMessage: "",
		};
	}

	if (changeType === "remove") {
		return {
			originalCode: t("fileWillBeDeleted"),
			modifiedCode: "",
			fileName: targetFileName,
			changeType: "remove" as OperationType,
			warningMessage: "",
			errorMessage: "",
		};
	}

	if (changeType === "add") {
		return {
			originalCode: "",
			modifiedCode: newCode,
			fileName: targetFileName,
			changeType: "add" as OperationType,
			warningMessage: "",
			errorMessage: "",
		};
	}

	const originalCode = new TextDecoder().decode(fileResource);
	return {
		originalCode,
		modifiedCode: newCode,
		fileName: targetFileName,
		changeType: (changeType || defaultSuggestionAction) as OperationType,
		warningMessage: "",
		errorMessage: "",
	};
};

export const validateCodeFixSuggestion = (suggestion: CodeFixSuggestionType): boolean => {
	if (!suggestion.fileName) {
		return false;
	}

	if (suggestion.changeType === "remove") {
		return true;
	}

	if (!suggestion.modifiedCode) {
		return false;
	}

	return true;
};
