import { useCallback } from "react";

import { useNavigate } from "react-router-dom";

import IndexedDBService from "@services/indexedDb.service";
import { ProjectsService } from "@services/projects.service";
import { FilesType } from "@src/types";

import { useFileStore } from "@store";

import * as files from "@assets/templates";

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
				await dbService.clearStore(); // Clear and replace the local cache
			}
			for (const [name, content] of Object.entries(data || {})) {
				await dbService.put(name, new Uint8Array(content));
			}

			return await fetchFiles();
		} catch (error) {
			console.error("Failed to sync resources from server:", error);
			throw error;
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

export const useSaveFilesToProject = (projectId: string) => {
	const navigate = useNavigate();

	const { saveFile } = useFileOperations(projectId);

	const saveFiles = async (assetDirectory: string) => {
		const directory = assetDirectory as keyof FilesType;
		const filesInDirectory = files[directory];

		if (filesInDirectory) {
			for (const fileName in filesInDirectory) {
				const setExtension = fileName.replace(/_(?=[^_]*$)/, ".");
				await saveFile(setExtension, filesInDirectory[fileName]);
			}
		}

		navigate(`/projects/${projectId}/connections`);
	};

	return saveFiles;
};
