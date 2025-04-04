import { createFileOperations } from "@factories";

import { useCacheStore, useFileStore, useToastStore } from "@store";

/**
 * Legacy hook implementation maintained for backward compatibility.
 * Acts as an adapter between the modern functional factory pattern and the previous hook-based API.
 * Consider migrating to direct usage of createFileOperations for new implementations.
 * @param projectId - The unique identifier of the project
 */
export const useFileOperations = (projectId: string) => {
	const { checkState } = useCacheStore();
	const { closeOpenedFile, fileList, openFileAsActive, openFiles, openProjectId, setFileList, setOpenProjectId } =
		useFileStore();
	const addToast = useToastStore((state) => state.addToast);

	const fileOperations = createFileOperations(projectId);

	return {
		saveFile: (name: string, content: string) =>
			fileOperations.saveFile(name, content, { checkState, setFileList, addToast }),
		saveAllFiles: (files: Record<string, Uint8Array>, newProjectId?: string) =>
			fileOperations.saveAllFiles(files, newProjectId),
		deleteFile: (name: string) =>
			fileOperations.deleteFile(name, { closeOpenedFile, setFileList, checkState, addToast }),
		setOpenProjectId,
		openFiles,
		openFileAsActive,
		closeOpenedFile,
		setFileList,
		fileList,
		openProjectId,
	};
};
