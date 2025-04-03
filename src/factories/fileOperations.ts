import { t } from "i18next";

import { IndexedDBService } from "@services";
import { LoggerService } from "@services/logger.service";
import { ProjectsService } from "@services/projects.service";
import { namespaces } from "@src/constants";
import { StoreCallbacks } from "@src/types";

export const createFileOperations = (projectId: string) => {
	const dbService = new IndexedDBService("ProjectDB", "resources");

	const saveFile = async (name: string, content: string, stores: StoreCallbacks) => {
		try {
			const contentUint8Array = new TextEncoder().encode(content);
			await dbService.put(projectId, [{ name, content: contentUint8Array }]);
			const resources = await dbService.getAll(projectId);
			if (!resources) return;
			const { error } = await ProjectsService.setResources(projectId, resources);
			stores.checkState(projectId, { resources });
			if (error) {
				return;
			}
			stores.setFileList({ isLoading: false, list: Object.keys(resources) });
		} catch (error) {
			stores.addToast({
				message: t("resourcesFetchError", { ns: "errors" }),
				type: "error",
			});
			LoggerService.error(
				namespaces.resourcesService,
				t("resourcesFetchErrorExtended", { projectId, error: error.message })
			);
		}
	};

	const saveAllFiles = async (files: Record<string, Uint8Array>, newProjectId?: string) => {
		const affectedProjectId = newProjectId || projectId;
		const filesArray = Object.entries(files).map(([name, content]) => ({
			name,
			content: new TextEncoder().encode(content.toString()),
		}));

		await dbService.put(affectedProjectId, filesArray);
		await ProjectsService.setResources(affectedProjectId, files);
	};

	const deleteFile = async (name: string, stores: StoreCallbacks & { closeOpenedFile: (name: string) => void }) => {
		try {
			stores.setFileList({ isLoading: true });
			await dbService.delete(projectId, name);
			stores.closeOpenedFile(name);
			const resources = await dbService.getAll(projectId);
			if (!resources) return;
			const { error } = await ProjectsService.setResources(projectId, resources);
			stores.setFileList({ isLoading: false, list: Object.keys(resources) });
			stores.checkState(projectId, { resources });
			if (error) throw error;
		} catch (error) {
			stores.addToast({
				message: t("resourcesFetchError", { ns: "errors" }),
				type: "error",
			});
			LoggerService.error(
				namespaces.resourcesService,
				t("resourcesFetchErrorExtended", { projectId, error: error.message })
			);
		}
	};

	return {
		saveFile,
		saveAllFiles,
		deleteFile,
	};
};
