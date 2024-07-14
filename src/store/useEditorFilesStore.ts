import { produce } from "immer";
import create from "zustand";
import { PersistOptions, persist } from "zustand/middleware";

interface FileState {
	openedFiles: { isActive: boolean; name: string }[];
	setOpenedFiles: (files: { isActive: boolean; name: string }[]) => void;
	updateOpenedFiles: (fileName: string) => void;
	closeOpenedFile: (fileName: string) => void;
	openFileAsActive: (fileName: string) => void;
}

const fileStorePersist: PersistOptions<FileState> = {
	name: "file-store",
};

const useFileStore = create<FileState>(
	(persist as any)(
		(set: any) => ({
			openedFiles: [],
			setOpenedFiles: (files: { isActive: boolean; name: string }[]) =>
				set((state: FileState) => ({ ...state, openedFiles: files })),
			updateOpenedFiles: (fileName: string) =>
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
			closeOpenedFile: (fileName: string) =>
				set(
					produce((state: FileState) => {
						state.openedFiles = state.openedFiles.filter((file) => file.name !== fileName);
					})
				),
			openFileAsActive: (fileName: string) =>
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
		}),
		fileStorePersist
	)
);

export default useFileStore;
