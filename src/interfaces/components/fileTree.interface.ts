import { NodeRendererProps } from "react-arborist";

export type FileTreeNode = {
	children?: FileTreeNode[];
	id: string;
	isFolder: boolean;
	name: string;
};

export interface FileTreeProps {
	activeFilePath?: string;
	data: FileTreeNode[];
	onFileClick: (path: string) => void;
	onFileDelete: (path: string, isDirectory?: boolean) => void;
	projectId: string;
	showSearch?: boolean;
}

export interface NodeProps {
	activeFilePath?: string;
	onlyFilesNoDirectories?: boolean;
	dragHandle?: NodeRendererProps<FileTreeNode>["dragHandle"];
	node: NodeRendererProps<FileTreeNode>["node"];
	onFileClick: (path: string) => void;
	onFileDelete: (path: string, isDirectory?: boolean) => void;
	style: NodeRendererProps<FileTreeNode>["style"];
}
