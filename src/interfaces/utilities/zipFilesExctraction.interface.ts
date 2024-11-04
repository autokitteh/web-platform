export interface FileNode {
	type: "file";
	content: string;
	path: string;
}

export interface DirectoryNode {
	type: "directory";
	children: FileStructure;
}

export interface ProcessedZipResult {
	structure: FileStructure;
	error?: never;
}

export interface ProcessedZipError {
	structure?: never;
	error: string;
}

export type ProcessedZipOutput = ProcessedZipResult | ProcessedZipError;

// Update the interfaces to match front-matter's types
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