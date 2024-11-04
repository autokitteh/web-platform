export interface FileNode {
	type: "file";
	content: string;
	path: string;
}

export interface DirectoryNode {
	type: "directory";
	children: FileStructure;
}

export interface MarkdownAttributes {
	[key: string]: unknown;
	title?: string;
	description?: string;
	categories?: string | string[];
	integrations?: string[];
}

export interface FileStructure {
	[key: string]: FileNode | DirectoryNode;
}

export interface FileWithContent {
	path: string;
	content: string;
}

export interface ProcessedZipResult {
	structure?: FileStructure;
	error?: string;
}
