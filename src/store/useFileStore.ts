import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";

interface FileState {
	openFiles: { isActive: boolean; name: string }[];
	setOpenFiles: (files: { isActive: boolean; name: string }[]) => void;
	updateOpenedFiles: (fileName: string) => void;
	closeOpenedFile: (fileName: string) => void;
	openFileAsActive: (fileName: string) => void;
	openProjectId: string;
	setOpenProjectId: (projectId: string) => void;
}
const store: StateCreator<FileState> = (set) => ({
	openFiles: [],
	openProjectId: "",
	setOpenProjectId: (projectId: string) => set((state) => ({ ...state, openProjectId: projectId })),
	setOpenFiles: (files: { isActive: boolean; name: string }[]) => set((state) => ({ ...state, openFiles: files })),
	updateOpenedFiles: (fileName: string) =>
		set((state) => {
			const fileExists = state.openFiles.find((file) => file.name === fileName);
			if (!fileExists) {
				state.openFiles.push({ name: fileName, isActive: true });

				return { ...state };
			}
			state.openFiles = state.openFiles.map((file) =>
				file.name === fileName ? { ...file, isActive: true } : { ...file, isActive: false }
			);

			return { ...state };
		}),
	closeOpenedFile: (fileName: string) =>
		set((state) => {
			const fileRemoved = state.openFiles.filter((file) => file.name !== fileName);
			if (!fileRemoved.length) {
				return { ...state, openFiles: [] };
			}
			const firstFile = { ...fileRemoved[0], isActive: true };
			fileRemoved.shift();

			return { ...state, openFiles: [firstFile, ...fileRemoved] };
		}),
	openFileAsActive: (fileName: string) =>
		set((state) => {
			const updatedFiles = state.openFiles.map((file) =>
				file.name === fileName ? { ...file, isActive: true } : { ...file, isActive: false }
			);
			const fileExists = updatedFiles.find((file) => file.name === fileName);
			if (!fileExists) {
				updatedFiles.push({ name: fileName, isActive: true });
			}

			return { ...state, openFiles: updatedFiles };
		}),
});
export const useFileStore = create(persist(immer(store), { name: StoreName.files }));
