import { useCallback } from "react";

import { useTranslation } from "react-i18next";

import IndexedDBService from "@services/indexedDb.service";
import { LoggerService } from "@services/logger.service";
import { ProjectsService } from "@services/projects.service";
import { namespaces } from "@src/constants";

import { useFileStore, useProjectValidationStore } from "@store";

const dbService = new IndexedDBService("ProjectDB", "resources");

export function useFileOperations(projectId: string) {
	const { t: tErrors } = useTranslation("errors");
	const {
		closeOpenedFile,
		fileList,
		openFileAsActive,
		openFiles,
		openProjectId,
		setFileList,
		setOpenFiles,
		setOpenProjectId,
	} = useFileStore();
	const { checkState } = useProjectValidationStore();

	const fetchFiles = useCallback(async () => {
		try {
			setFileList({ isLoading: true });
			const resources = await dbService.getAll();
			if (resources) {
				checkState(projectId!, true);
			}

			setFileList({ isLoading: false, list: Object.keys(resources) });

			return resources;
		} catch (error) {
			console.error("Failed to sync resources from DB:", error);
			throw error;
		} finally {
			setFileList({ isLoading: false });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchResources = async (clearStore?: boolean) => {
		try {
			setFileList({ isLoading: true });
			const { data, error } = await ProjectsService.getResources(projectId);

			if (error) throw new Error((error as Error).message);
			if (clearStore) {
				await dbService.clearStore();
			}
			for (const [name, content] of Object.entries(data || {})) {
				await dbService.put(name, new Uint8Array(content));
			}
			const resources = await dbService.getAll();
			if (resources) {
				checkState(projectId!, true);
				setFileList({ isLoading: false, list: Object.keys(resources) });
			}

			return resources;
		} catch (error) {
			console.error("Failed to sync resources from server:", error);
			throw error;
		} finally {
			setFileList({ isLoading: false });
		}
	};

	const saveFile = useCallback(
		async (name: string, content: string) => {
			// eslint-disable-next-line no-useless-catch
			try {
				const contentUint8Array = new TextEncoder().encode(content);
				await dbService.put(name, contentUint8Array);
				const resources = await dbService.getAll();

				const { error } = await ProjectsService.setResources(projectId, resources);

				if (error) {
					LoggerService.error(
						namespaces.resourcesService,
						tErrors("resourcesFetchErrorExtended", { projectId, error: (error as Error).message })
					);
					throw error;
				}
				setFileList({ isLoading: false, list: Object.keys(resources) });
			} catch (error) {
				throw error;
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectId, tErrors]
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
			const resources = await fetchFiles();

			await ProjectsService.setResources(projectId, resources);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[closeOpenedFile, projectId]
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
		setFileList,
		fileList,
	};
}
