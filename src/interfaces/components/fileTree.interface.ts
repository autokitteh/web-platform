import React from "react";

import { NodeRendererProps } from "react-arborist";

export type FileTreeNode = {
	children?: FileTreeNode[];
	id: string;
	isFolder: boolean;
	name: string;
};

export interface FileTreeProps {
	data: FileTreeNode[];
	activeFilePath?: string;
	onFileClick: (path: string) => void;
	onFileDelete: (path: string) => void;
	height: number;
	isUploadingFiles: boolean;
	handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface NodeProps {
	node: NodeRendererProps<FileTreeNode>["node"];
	style: NodeRendererProps<FileTreeNode>["style"];
	activeFilePath?: string;
	onFileClick: (path: string) => void;
	onFileDelete: (path: string) => void;
}
