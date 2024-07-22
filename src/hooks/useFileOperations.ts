import { useCallback } from "react";

import IndexedDBService from "@services/indexedDb.service";
import { ProjectsService } from "@services/projects.service";

import { useFileStore } from "@store";

const dbService = new IndexedDBService("ProjectDB", "resources");

export function useFileOperations(projectId: string) {
	const { closeOpenedFile, openFileAsActive, openProjectId, openedFiles, setOpenFiles, setOpenProjectId } =
		useFileStore((state) => ({
			setOpenFiles: state.setOpenFiles,
			closeOpenedFile: state.closeOpenedFile,
			openProjectId: state.openProjectId,
			setOpenProjectId: state.setOpenProjectId,
			openedFiles: state.openedFiles,
			openFileAsActive: state.openFileAsActive,
		}));

	const fetchFiles = useCallback(async () => await dbService.getAll(), []);

	const fetchResources = async (clearStore?: boolean) => {
		try {
			const { data, error } = await ProjectsService.getResources(projectId);
			if (error) throw new Error((error as Error).message);
			if (clearStore) {
				await dbService.clearStore(); // Clear and replace the local cache
			}
			for (const [name, content] of Object.entries(data || {})) {
				await dbService.put(name, new Uint8Array(content));
			}

			return await dbService.getAll();
		} catch (error) {
			console.error("Failed to sync resources from server:", error);
			throw error;
		}
	};

	// Fetch files from the server and update the local IndexedDB
	const fetchFilesFromServer = useCallback(async () => {
		const { data, error } = await ProjectsService.getResources(projectId);
		if (error) {
			console.error("Failed to fetch resources from server:", error);

			return;
		}

		for (const [name, content] of Object.entries(data || {})) {
			await dbService.put(name, new Uint8Array(content));
		}

		fetchFiles(); // Update local files from IndexedDB after syncing
	}, [projectId, fetchFiles]);

	const saveFile = useCallback(
		async (name: string, content: string) => {
			const contentUint8Array = new TextEncoder().encode(content);
			await dbService.put(name, contentUint8Array);
			const resources = await dbService.getAll();

			await ProjectsService.setResources(projectId, resources);
			fetchFiles();
		},
		[projectId, fetchFiles]
	);

	const deleteFile = useCallback(
		async (name: string) => {
			await dbService.delete(name);
			closeOpenedFile(name);
			await ProjectsService.setResources(projectId, {});
			fetchFiles();
		},
		[projectId, closeOpenedFile, fetchFiles]
	);

	const addFile = useCallback(
		async (name: string) => {
			const resources = await dbService.getAll();
			const resourcesWithAddedFile = {
				...resources,
				[name]: new Uint8Array(),
			};
			const { error } = await ProjectsService.setResources(projectId, resourcesWithAddedFile);
			if (error) {
				throw error;
			}
			dbService.put(name, new Uint8Array());
			fetchFiles();
		},
		[projectId, fetchFiles]
	);

	return {
		fetchFiles,
		saveFile,
		deleteFile,
		fetchFilesFromServer,
		fetchResources,
		openProjectId,
		setOpenProjectId,
		setOpenFiles,
		openedFiles,
		openFileAsActive,
		closeOpenedFile,
		addFile,
	};
}
