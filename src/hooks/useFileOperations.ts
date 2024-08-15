import { useCallback } from "react";

import IndexedDBService from "@services/indexedDb.service";
import { ProjectsService } from "@services/projects.service";

import { useFileStore } from "@store";

const dbService = new IndexedDBService("ProjectDB", "resources");

export function useFileOperations(projectId: string) {
	const { closeOpenedFile, openFileAsActive, openFiles, openProjectId, setOpenFiles, setOpenProjectId } =
		useFileStore((state) => ({
			setOpenFiles: state.setOpenFiles,
			closeOpenedFile: state.closeOpenedFile,
			openProjectId: state.openProjectId,
			setOpenProjectId: state.setOpenProjectId,
			openFiles: state.openFiles,
			openFileAsActive: state.openFileAsActive,
		}));

	const fetchFiles = useCallback(async () => await dbService.getAll(), []);

	const fetchResources = async (clearStore?: boolean) => {
		try {
			const { data, error } = await ProjectsService.getResources(projectId);
			if (error) throw new Error((error as Error).message);
			if (clearStore) {
				await dbService.clearStore();
			}
			for (const [name, content] of Object.entries(data || {})) {
				await dbService.put(name, new Uint8Array(content));
			}

			return await fetchFiles();
		} catch (error) {
			return error;
		}
	};

	const saveFile = useCallback(
		async (name: string, content: string) => {
			const contentUint8Array = new TextEncoder().encode(content);
			await dbService.put(name, contentUint8Array);
			const resources = await dbService.getAll();

			await ProjectsService.setResources(projectId, resources);
		},
		[projectId]
	);

	const saveAllFiles = useCallback(
		async (filesUint8ArrayContent: Record<string, Uint8Array>) => {
			for (const [name, content] of Object.entries(filesUint8ArrayContent)) {
				await dbService.put(name, content);
			}
			await ProjectsService.setResources(projectId, filesUint8ArrayContent);
		},
		[projectId]
	);

	const deleteFile = useCallback(
		async (name: string) => {
			await dbService.delete(name);
			closeOpenedFile(name);
			await ProjectsService.setResources(projectId, {});
		},
		[projectId, closeOpenedFile]
	);

	const addFile = useCallback(
		async (name: string, fileContent: Uint8Array) => {
			const resources = await dbService.getAll();
			const resourcesWithAddedFile = {
				...resources,
				[name]: fileContent,
			};
			const { error } = await ProjectsService.setResources(projectId, resourcesWithAddedFile);
			if (error) {
				throw error;
			}
			dbService.put(name, fileContent);
		},
		[projectId]
	);

	return {
		fetchFiles,
		saveFile,
		saveAllFiles,
		deleteFile,
		fetchResources,
		openProjectId,
		setOpenProjectId,
		setOpenFiles,
		openFiles,
		openFileAsActive,
		closeOpenedFile,
		addFile,
	};
}
