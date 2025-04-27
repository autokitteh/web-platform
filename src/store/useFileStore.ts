import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { FileStore } from "@interfaces/store";

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
			const files = state.openFiles[openProjectId];
			if (!files?.length) return state;

			const fileIndex = files.findIndex((file) => file.name === fileName);
			if (fileIndex === -1) return state;

			const updatedFiles = files.filter((file) => file.name !== fileName);

			if (files[fileIndex].isActive && updatedFiles.length) {
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
