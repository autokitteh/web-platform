import { useCallback } from "react";

import { t } from "i18next";
import { useTranslation } from "react-i18next";

import IndexedDBService from "@services/indexedDb.service";
import { ProjectsService } from "@services/projects.service";

import { useFileStore, useProjectValidationStore, useToastStore } from "@store";

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
	const addToast = useToastStore((state) => state.addToast);

	const getResources = useCallback(async () => await dbService.getAll(), []);

	const fetchResources = async (clearStore?: boolean) => {
		try {
			setFileList({ isLoading: true });
			const { data, error } = await ProjectsService.getResources(projectId);

			if (error) {
				addToast({
					message: t("resourcesFetchError"),
					type: "error",
				});

				return;
			}
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
		} finally {
			setFileList({ isLoading: false });
		}
	};

	const saveFile = useCallback(
		async (name: string, content: string) => {
			try {
				const contentUint8Array = new TextEncoder().encode(content);
				await dbService.put(name, contentUint8Array);
				const resources = await dbService.getAll();

				const { error } = await ProjectsService.setResources(projectId, resources);
				checkState(projectId!, true);
				if (error) {
					throw new Error(t("resourcesFetchError"));
				}
				setFileList({ isLoading: false, list: Object.keys(resources) });
			} catch (error) {
				addToast({
					message: error.message,
					type: "error",
				});
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
			setFileList({ isLoading: true });
			await dbService.delete(name);
			closeOpenedFile(name);
			const resources = await dbService.getAll();
			const { error } = await ProjectsService.setResources(projectId, resources);
			setFileList({ isLoading: false, list: Object.keys(resources) });
			checkState(projectId!, true);
			if (error) {
				addToast({
					message: t("resourcesFetchError"),
					type: "error",
				});
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
			checkState(projectId!, true);
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
		getResources,
	};
}
