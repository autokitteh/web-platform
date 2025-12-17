export interface DeleteFileModalData {
	name: string;
	isDirectory?: boolean;
	fileCount?: number;
}

export interface FileTabMenuProps {
	fileName: string;
	isOpen: boolean;
	onClose: () => void;
	position: { x: number; y: number };
	projectId: string;
}
