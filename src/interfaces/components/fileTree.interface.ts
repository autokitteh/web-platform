import React from "react";

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
	handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
	isUploadingFiles: boolean;
	onFileClick: (path: string) => void;
	onFileDelete: (path: string, isDirectory?: boolean) => void;
	projectId: string;
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
