interface IProjectStoreResponse {
	error?: unknown;
}

export interface IProjectStore {
	projectId?: string;
	activeEditorFileName: string;
	projectUpdateCount: number;
	resources: Record<string, Uint8Array>;
	loadProject: (projectId: string) => Promise<IProjectStoreResponse>;
	setUpdateCount: () => void;
	setUpdateFileContent: (content: Uint8Array) => void;
	setProjectResources: (file: File) => Promise<IProjectStoreResponse>;
	setProjectEmptyResources: (name: string) => Promise<IProjectStoreResponse>;
	getProjectResources: () => Promise<IProjectStoreResponse>;
}
