export interface UseProjectFilesVisibilityArgs {
	projectId?: string;
}

export interface UseProjectFilesVisibilityReturn {
	handleShowProjectFiles: () => void;
	isExplorerPage: boolean;
	shouldShowProjectFiles: boolean;
	showFiles: boolean;
	showFilesButton: boolean;
}
