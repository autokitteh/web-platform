import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { FileStore } from "@src/interfaces/store";

const setActiveFile = (files: { isActive: boolean; name: string }[], fileName: string) =>
	files.map((file) => ({ ...file, isActive: file.name === fileName }));

const store: StateCreator<FileStore> = (set) => ({
	fileList: {
		isLoading: true,
		list: [],
	},
	openFiles: {},
	openProjectId: "",
	setFileList: (payload) =>
		set((state) => {
			state.fileList = { ...state.fileList, ...payload };

			return state;
		}),

	setOpenProjectId: (projectId) => set((state) => ({ ...state, openProjectId: projectId })),

	updateOpenedFiles: (fileName) =>
		set((state) => {
			const { openFiles, openProjectId } = state;
			const projectFiles = openFiles[openProjectId] || [];

			if (projectFiles.some((file) => file.name === fileName)) {
				state.openFiles[openProjectId] = setActiveFile(projectFiles, fileName);

				return state;
			}

			state.openFiles[openProjectId] = [
				{ name: fileName, isActive: true },
				...setActiveFile(projectFiles, fileName),
			];

			return state;
		}),

	closeOpenedFile: (fileName) =>
		set((state) => {
			const { openProjectId } = state;
			const files = state.openFiles[openProjectId] || [];

			const fileToClose = files.find((file) => file.name === fileName);
			const updatedFiles = files.filter((file) => file.name !== fileName);

			// If we're closing the active file and there are other files, set the first remaining file as active
			if (fileToClose?.isActive && updatedFiles.length > 0) {
				updatedFiles[0].isActive = true;
			}

			state.openFiles[openProjectId] = updatedFiles;

			return state;
		}),

	openFileAsActive: (fileName) =>
		set((state) => {
			const { openFiles, openProjectId } = state;
			const projectFiles = openFiles[openProjectId] || [];

			if (projectFiles.some((file) => file.name === fileName)) {
				state.openFiles[openProjectId] = setActiveFile(projectFiles, fileName);

				return state;
			}

			state.openFiles[openProjectId] = [
				{ name: fileName, isActive: true },
				...setActiveFile(projectFiles, fileName),
			];

			return state;
		}),
});

export const useFileStore = create(
	persist(immer(store), {
		name: StoreName.files,
		version: 1,
		migrate: () => {
			return {};
		},
	})
);
