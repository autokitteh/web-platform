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
				await dbService.put(projectId, [{ name, content: contentUint8Array }]);
				const resources = await dbService.getAll(projectId);
				if (!resources) return;
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
		async (files: Record<string, Uint8Array>, newProjectId?: string) => {
			const affectedProjectId = newProjectId || projectId;
			const filesArray = Object.entries(files).map(([name, content]) => ({
				name,
				content: new TextEncoder().encode(content.toString()),
			}));

			await dbService.put(affectedProjectId, filesArray);
			await ProjectsService.setResources(affectedProjectId, files);
		},
		[projectId]
	);

	const deleteFile = useCallback(
		async (name: string) => {
			try {
				setFileList({ isLoading: true });
				await dbService.delete(projectId, name);
				closeOpenedFile(name);
				const resources = await dbService.getAll(projectId);
				if (!resources) return;
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

	return {
		saveFile,
		saveAllFiles,
		deleteFile,
		setOpenProjectId,
		openFiles,
		openFileAsActive,
		closeOpenedFile,
		setFileList,
		fileList,
		openProjectId,
	};
}
