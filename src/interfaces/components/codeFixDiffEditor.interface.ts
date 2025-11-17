import { CodeFixSuggestionType } from "@src/types";

export interface CodeFixDiffEditorProps extends CodeFixSuggestionType {
	onApprove: () => void;
	onReject: () => void;
}
