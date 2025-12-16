import { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { defaultCodeFixSuggestion } from "../constants/monacoEditor.constants";
import { CodeFixSuggestionType } from "../types";

interface CodeFixStore {
	codeFixData: CodeFixSuggestionType;
	onApprove: (() => Promise<void>) | null;
	onReject: ((sendRejection?: boolean) => void) | null;
	setCodeFixData: (data: CodeFixSuggestionType) => void;
	setHandlers: (onApprove: () => Promise<void>, onReject: (sendRejection?: boolean) => void) => void;
	reset: () => void;
}

const store: StateCreator<CodeFixStore> = (set) => ({
	codeFixData: defaultCodeFixSuggestion,
	onApprove: null,
	onReject: null,
	setCodeFixData: (data) => set({ codeFixData: data }),
	setHandlers: (onApprove, onReject) => set({ onApprove, onReject }),
	reset: () =>
		set({
			codeFixData: defaultCodeFixSuggestion,
			onApprove: null,
			onReject: null,
		}),
});

export const useCodeFixStore = create(store, shallow);
