import { produce } from "immer";
import { create } from "zustand";
import { PersistOptions, persist } from "zustand/middleware";

interface FileState {
	openedFiles: { isActive: boolean; name: string }[];
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
			openedFiles: [],
			openProjectId: "",
			setOpenProjectId: (projectId: string) =>
				set((state: FileState) => ({ ...state, openProjectId: projectId })),
			setOpenFiles: (files: { isActive: boolean; name: string }[]) =>
				set((state: FileState) => ({ ...state, openedFiles: files })),
			updateOpenFiles: (fileName: string) =>
				set(
					produce((state: FileState) => {
						const fileExists = state.openedFiles.find((file) => file.name === fileName);
						if (!fileExists) {
							state.openedFiles.push({ name: fileName, isActive: true });
						} else {
							state.openedFiles = state.openedFiles.map((file) =>
								file.name === fileName ? { ...file, isActive: true } : { ...file, isActive: false }
							);
						}
					})
				),
			closeOpenFile: (fileName: string) =>
				set(
					produce((state: FileState) => {
						const fileRemoved = state.openedFiles.filter((file) => file.name !== fileName);
						if (!fileRemoved.length) {
							state.openedFiles = [];

							return;
						}
						const firstFile = { ...fileRemoved[0], isActive: true };
						fileRemoved.shift();

						state.openedFiles = [firstFile, ...fileRemoved];
					})
				),
			openFileAsActive: (fileName: string) =>
				set(
					produce((state: FileState) => {
						state.openedFiles = state.openedFiles.map((file) =>
							file.name === fileName ? { ...file, isActive: true } : { ...file, isActive: false }
						);
						const fileExists = state.openedFiles.find((file) => file.name === fileName);
						if (!fileExists) {
							state.openedFiles.push({ name: fileName, isActive: true });
						}
					})
				),
		}),
		fileStorePersist
	)
);
