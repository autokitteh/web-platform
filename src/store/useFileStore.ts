import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";

interface FileState {
	openFiles: Record<string, { isActive: boolean; name: string }[]>;
	openProjectId: string;
	setOpenProjectId: (projectId: string) => void;
	setOpenFiles: (projectId: string, files: { isActive: boolean; name: string }[]) => void;
	updateOpenedFiles: (fileName: string) => void;
	closeOpenedFile: (fileName: string) => void;
	openFileAsActive: (fileName: string) => void;
}

const setActiveFile = (files: { isActive: boolean; name: string }[], fileName: string) =>
	files.map((file) => ({ ...file, isActive: file.name === fileName }));

const store: StateCreator<FileState> = (set) => ({
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
			const { openFiles, openProjectId } = state;
			const projectFiles = openFiles[openProjectId];
			if (!projectFiles) return state;

			const index = projectFiles.findIndex((file) => file.name === fileName);
			if (index === -1) return state;

			const wasActive = projectFiles[index].isActive;
			projectFiles.splice(index, 1);

			if (!projectFiles.length) {
				delete openFiles[openProjectId];
			} else if (wasActive) {
				projectFiles[0].isActive = true;
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
