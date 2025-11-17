import type { OperationType } from "../global";

export type CodeFixSuggestionType = {
	changeType: OperationType;
	errorMessage?: string;
	fileName: string;
	modifiedCode: string;
	originalCode: string;
	warningMessage?: string;
};
