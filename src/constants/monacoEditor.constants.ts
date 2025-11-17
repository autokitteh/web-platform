import { CodeFixSuggestionType, OperationType } from "@src/types";

export const defaultCodeFixSuggestion: CodeFixSuggestionType = {
	changeType: "modify",
	fileName: "",
	modifiedCode: "",
	originalCode: "",
};

export const defaultSuggestionAction: OperationType = "add";
