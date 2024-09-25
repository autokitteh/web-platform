export interface FileStore {
	openFiles: Record<string, { isActive: boolean; name: string }[]>;
	openProjectId: string;
	setOpenProjectId: (projectId: string) => void;
	setOpenFiles: (projectId: string, files: { isActive: boolean; name: string }[]) => void;
	updateOpenedFiles: (fileName: string) => void;
	closeOpenedFile: (fileName: string) => void;
	openFileAsActive: (fileName: string) => void;
}
