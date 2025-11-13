import { t } from "i18next";

import { IndexedDBService } from "@services";
import { LoggerService } from "@services/logger.service";
import { ProjectsService } from "@services/projects.service";
import { defaultManifestFileName, namespaces } from "@src/constants";
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
		const filteredFiles = Object.fromEntries(
			Object.entries(files).filter(([name]) => name !== defaultManifestFileName)
		);
		const affectedProjectId = newProjectId || projectId;
		const filesArray = Object.entries(filteredFiles).map(([name, content]) => ({
			name,
			content,
		}));

		await dbService.put(affectedProjectId, filesArray);
		await ProjectsService.setResources(affectedProjectId, filteredFiles);
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

	const createDirectory = async (directoryName: string): Promise<boolean | undefined> => {
		const { setFileList } = useFileStore.getState();
		const { checkState } = useCacheStore.getState();
		try {
			const keepFileName = `${directoryName}/.keep`;
			const keepFileContent = new TextEncoder().encode("");
			await dbService.put(projectId, [{ name: keepFileName, content: keepFileContent }]);
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

	const renameFile = async (oldName: string, newName: string): Promise<boolean | undefined> => {
		const { setFileList, closeOpenedFile, openFileAsActive } = useFileStore.getState();
		const { checkState } = useCacheStore.getState();
		try {
			setFileList({ isLoading: true });
			const resources = await dbService.getAll(projectId);
			if (!resources || !resources[oldName]) {
				throw new Error(`File ${oldName} not found`);
			}

			const fileContent = resources[oldName];
			await dbService.delete(projectId, oldName);
			await dbService.put(projectId, [{ name: newName, content: fileContent }]);

			const updatedResources = await dbService.getAll(projectId);
			if (!updatedResources) return;

			const { error } = await ProjectsService.setResources(projectId, updatedResources);
			checkState(projectId, { resources: updatedResources });
			if (error) {
				throw error;
			}

			const { openFiles } = useFileStore.getState();
			const projectOpenFiles = openFiles[projectId] || [];
			const wasOpen = projectOpenFiles.some((f) => f.name === oldName);
			const wasActive = projectOpenFiles.find((f) => f.name === oldName)?.isActive;

			closeOpenedFile(oldName);
			if (wasOpen) {
				openFileAsActive(newName);
				if (!wasActive) {
					const currentlyActive = projectOpenFiles.find((f) => f.isActive && f.name !== oldName);
					if (currentlyActive) {
						openFileAsActive(currentlyActive.name);
					}
				}
			}

			setFileList({ isLoading: false, list: Object.keys(updatedResources) });
			return true;
		} catch (error) {
			LoggerService.error(
				namespaces.resourcesService,
				t("resourcesFetchErrorExtended", { projectId, error: error.message })
			);
			setFileList({ isLoading: false });
			return;
		}
	};

	const renameDirectory = async (oldPath: string, newPath: string): Promise<boolean | undefined> => {
		const { setFileList, closeOpenedFile, openFileAsActive } = useFileStore.getState();
		const { checkState } = useCacheStore.getState();
		try {
			setFileList({ isLoading: true });
			const resources = await dbService.getAll(projectId);
			if (!resources) return;

			const normalizedOldPath = oldPath.endsWith("/") ? oldPath : `${oldPath}/`;
			const normalizedNewPath = newPath.endsWith("/") ? newPath : `${newPath}/`;

			const filesToRename = Object.keys(resources).filter((fileName) => fileName.startsWith(normalizedOldPath));

			if (filesToRename.length === 0) {
				throw new Error(`No files found in directory ${oldPath}`);
			}

			const renamedFiles: { content: Uint8Array; name: string }[] = [];
			const { openFiles } = useFileStore.getState();
			const projectOpenFiles = openFiles[projectId] || [];
			const openedFilesToUpdate: { new: string; old: string; wasActive: boolean }[] = [];

			for (const oldFileName of filesToRename) {
				const newFileName = oldFileName.replace(normalizedOldPath, normalizedNewPath);
				renamedFiles.push({ content: resources[oldFileName], name: newFileName });

				const openFile = projectOpenFiles.find((f) => f.name === oldFileName);
				if (openFile) {
					openedFilesToUpdate.push({ new: newFileName, old: oldFileName, wasActive: openFile.isActive });
				}

				await dbService.delete(projectId, oldFileName);
			}

			await dbService.put(projectId, renamedFiles);

			const updatedResources = await dbService.getAll(projectId);
			if (!updatedResources) return;

			const { error } = await ProjectsService.setResources(projectId, updatedResources);
			checkState(projectId, { resources: updatedResources });
			if (error) {
				throw error;
			}

			for (const { old: oldFileName, new: newFileName, wasActive } of openedFilesToUpdate) {
				closeOpenedFile(oldFileName);
				openFileAsActive(newFileName);
				if (!wasActive) {
					const currentlyActive = projectOpenFiles.find((f) => f.isActive && f.name !== oldFileName);
					if (currentlyActive) {
						openFileAsActive(currentlyActive.name);
					}
				}
			}

			setFileList({ isLoading: false, list: Object.keys(updatedResources) });
			return true;
		} catch (error) {
			LoggerService.error(
				namespaces.resourcesService,
				t("resourcesFetchErrorExtended", { projectId, error: error.message })
			);
			setFileList({ isLoading: false });
			return;
		}
	};

	const deleteDirectory = async (directoryPath: string): Promise<boolean | undefined> => {
		const { setFileList, closeOpenedFile } = useFileStore.getState();
		const { checkState } = useCacheStore.getState();
		try {
			setFileList({ isLoading: true });
			const resources = await dbService.getAll(projectId);
			if (!resources) return;

			const normalizedPath = directoryPath.endsWith("/") ? directoryPath : `${directoryPath}/`;
			const filesToDelete = Object.keys(resources).filter((fileName) => fileName.startsWith(normalizedPath));

			if (filesToDelete.length === 0) {
				throw new Error(`No files found in directory ${directoryPath}`);
			}

			for (const fileName of filesToDelete) {
				await dbService.delete(projectId, fileName);
				closeOpenedFile(fileName);
			}

			const updatedResources = await dbService.getAll(projectId);
			if (!updatedResources) return;

			const { error } = await ProjectsService.setResources(projectId, updatedResources);
			checkState(projectId, { resources: updatedResources });
			if (error) {
				throw error;
			}

			setFileList({ isLoading: false, list: Object.keys(updatedResources) });
			return true;
		} catch (error) {
			LoggerService.error(
				namespaces.resourcesService,
				t("resourcesFetchErrorExtended", { projectId, error: error.message })
			);
			setFileList({ isLoading: false });
			return;
		}
	};

	return {
		saveFile,
		saveAllFiles,
		deleteFile,
		createDirectory,
		renameFile,
		renameDirectory,
		deleteDirectory,
	};
};
