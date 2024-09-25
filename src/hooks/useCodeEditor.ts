import React, { useCallback } from "react";

export const useEditorContent = (initialContent = "") => {
	const [content, setContent] = React.useState(initialContent);

	return [content, setContent] as const;
};

export const useAutosave = (initialState = true) => {
	const [autosave, setAutosave] = React.useState(initialState);
	const toggleAutosave = useCallback(() => setAutosave((prev) => !prev), []);

	return [autosave, toggleAutosave] as const;
};

export const useSaveState = () => {
	const [loadingSave, setLoadingSave] = React.useState(false);
	const [lastSaved, setLastSaved] = React.useState<string | undefined>();
	const updateSaveState = useCallback((isLoading: boolean, savedTime?: string) => {
		setLoadingSave(isLoading);
		if (savedTime) setLastSaved(savedTime);
	}, []);

	return [loadingSave, lastSaved, updateSaveState] as const;
};
