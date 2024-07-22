import { produce } from "immer";
import { create } from "zustand";
import { PersistOptions, persist } from "zustand/middleware";

interface FileState {
	openFiles: { isActive: boolean; name: string }[];
	setOpenFiles: (files: { isActive: boolean; name: string }[]) => void;
	updateOpenedFiles: (fileName: string) => void;
	closeOpenedFile: (fileName: string) => void;
	openFileAsActive: (fileName: string) => void;
	openProjectId: string;
	setOpenProjectId: (projectId: string) => void;
}

const fileStorePersist: PersistOptions<FileState> = {
	name: "file-store",
};

export const useFileStore = create<FileState>(
	(persist as any)(
		(set: any) => ({
			openFiles: [],
			openProjectId: "",
			setOpenProjectId: (projectId: string) =>
				set((state: FileState) => ({ ...state, openProjectId: projectId })),
			setOpenFiles: (files: { isActive: boolean; name: string }[]) =>
				set((state: FileState) => ({ ...state, openedFiles: files })),
			updateOpenFiles: (fileName: string) =>
				set(
					produce((state: FileState) => {
						const fileExists = state.openFiles.find((file) => file.name === fileName);
						if (!fileExists) {
							state.openFiles.push({ name: fileName, isActive: true });
						} else {
							state.openFiles = state.openFiles.map((file) =>
								file.name === fileName ? { ...file, isActive: true } : { ...file, isActive: false }
							);
						}
					})
				),
			closeOpenFile: (fileName: string) =>
				set(
					produce((state: FileState) => {
						const fileRemoved = state.openFiles.filter((file) => file.name !== fileName);
						if (!fileRemoved.length) {
							state.openFiles = [];

							return;
						}
						const firstFile = { ...fileRemoved[0], isActive: true };
						fileRemoved.shift();

						state.openFiles = [firstFile, ...fileRemoved];
					})
				),
			openFileAsActive: (fileName: string) =>
				set(
					produce((state: FileState) => {
						state.openFiles = state.openFiles.map((file) =>
							file.name === fileName ? { ...file, isActive: true } : { ...file, isActive: false }
						);
						const fileExists = state.openFiles.find((file) => file.name === fileName);
						if (!fileExists) {
							state.openFiles.push({ name: fileName, isActive: true });
						}
					})
				),
		}),
		fileStorePersist
	)
);
