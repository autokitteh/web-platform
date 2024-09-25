import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { FileStore } from "@src/interfaces/store";

const setActiveFile = (files: { isActive: boolean; name: string }[], fileName: string) =>
	files.map((file) => ({ ...file, isActive: file.name === fileName }));

const store: StateCreator<FileStore> = (set) => ({
	openFiles: {},
	openProjectId: "",
	setOpenProjectId: (projectId) => set((state) => ({ ...state, openProjectId: projectId })),
	setOpenFiles: (projectId, files) =>
		set((state) => {
			state.openFiles[projectId] = files;

			return state;
		}),

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
			const files = state.openFiles[state.openProjectId];
			if (!files) return state;

			const index = files.findIndex((file) => file.name === fileName);
			if (index === -1) return state;

			const wasActive = files[index].isActive;
			files.splice(index, 1);

			if (wasActive && files.length) {
				files[0].isActive = true;
			}
			if (!files.length) {
				delete state.openFiles[state.openProjectId];
			}

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

export const useFileStore = create(persist(immer(store), { name: StoreName.files }));
