import { t } from "i18next";

import { IndexedDBService } from "@services";
import { LoggerService } from "@services/logger.service";
import { ProjectsService } from "@services/projects.service";
import { namespaces } from "@src/constants";
import { useCacheStore, useFileStore } from "@src/store";

export const fileOperations = (projectId: string) => {
	const dbService = new IndexedDBService("ProjectDB", "resources");

	const saveFile = async (name: string, content: string): Promise<boolean | undefined> => {
		const { setFileList } = useFileStore.getState();
		const { checkState } = useCacheStore.getState();
		try {
			const contentUint8Array = new TextEncoder().encode(content);
			await dbService.put(projectId, [{ name, content: contentUint8Array }]);
			const resources = await dbService.getAll(projectId);
			if (!resources) return;
			const { error } = await ProjectsService.setResources(projectId, resources);
			checkState(projectId, { resources });
			if (error) {
				return;
			}
			setFileList({ isLoading: false, list: Object.keys(resources) });

			return true;
		} catch (error) {
			LoggerService.error(
				namespaces.resourcesService,
				t("resourcesFetchErrorExtended", { projectId, error: error.message })
			);
			return;
		}
	};

	const saveAllFiles = async (files: Record<string, Uint8Array>, newProjectId?: string) => {
		const affectedProjectId = newProjectId || projectId;
		const filesArray = Object.entries(files).map(([name, content]) => ({
			name,
			content,
		}));

		await dbService.put(affectedProjectId, filesArray);
		await ProjectsService.setResources(affectedProjectId, files);
	};

	const deleteFile = async (name: string) => {
		try {
			const { setFileList, closeOpenedFile } = useFileStore.getState();
			const { checkState } = useCacheStore.getState();
			setFileList({ isLoading: true });
			await dbService.delete(projectId, name);
			closeOpenedFile(name);
			const resources = await dbService.getAll(projectId);
			if (!resources) return;
			const { error } = await ProjectsService.setResources(projectId, resources);
			setFileList({ isLoading: false, list: Object.keys(resources) });
			checkState(projectId, { resources });
			if (error) throw error;
		} catch (error) {
			LoggerService.error(
				namespaces.resourcesService,
				t("resourcesFetchErrorExtended", { projectId, error: error.message })
			);
			return true;
		}
	};

	return {
		saveFile,
		saveAllFiles,
		deleteFile,
	};
};
