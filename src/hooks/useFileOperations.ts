import { useCallback } from "react";

import { t } from "i18next";
import { useTranslation } from "react-i18next";

import { IndexedDBService } from "@services";
import { LoggerService } from "@services/logger.service";
import { ProjectsService } from "@services/projects.service";
import { namespaces } from "@src/constants";

import { useCacheStore, useFileStore, useToastStore } from "@store";

const dbService = new IndexedDBService("ProjectDB", "resources");

export function useFileOperations(projectId: string) {
	const { t: tErrors } = useTranslation("errors");
	const { closeOpenedFile, fileList, openFileAsActive, openFiles, openProjectId, setFileList, setOpenProjectId } =
		useFileStore();
	const { checkState } = useCacheStore();
	const addToast = useToastStore((state) => state.addToast);

	const saveFile = useCallback(
		async (name: string, content: string) => {
			try {
				const contentUint8Array = new TextEncoder().encode(content);
				await dbService.put(name, contentUint8Array);
				const resources = await dbService.getAll();
				const { error } = await ProjectsService.setResources(projectId, resources);
				checkState(projectId!, { resources });
				if (error) {
					return;
				}
				setFileList({ isLoading: false, list: Object.keys(resources) });
			} catch (error) {
				addToast({
					message: t("resourcesFetchError"),
					type: "error",
				});
				LoggerService.error(
					namespaces.resourcesService,
					t("resourcesFetchErrorExtended", { projectId, error: error.message })
				);
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
			try {
				setFileList({ isLoading: true });
				await dbService.delete(name);
				closeOpenedFile(name);
				const resources = await dbService.getAll();
				const { error } = await ProjectsService.setResources(projectId, resources);
				setFileList({ isLoading: false, list: Object.keys(resources) });
				checkState(projectId!, { resources });
				if (error) throw error;
			} catch (error) {
				addToast({
					message: t("resourcesFetchError"),
					type: "error",
				});
				LoggerService.error(
					namespaces.resourcesService,
					t("resourcesFetchErrorExtended", { projectId, error: error.message })
				);
			}
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
			checkState(projectId!, { resources: resourcesWithAddedFile });
			if (error) {
				throw error;
			}
			dbService.put(name, fileContent);
		},
		[checkState, projectId]
	);

	return {
		saveFile,
		saveAllFiles,
		deleteFile,
		setOpenProjectId,
		openFiles,
		openFileAsActive,
		closeOpenedFile,
		addFile,
		setFileList,
		fileList,
		openProjectId,
	};
}
