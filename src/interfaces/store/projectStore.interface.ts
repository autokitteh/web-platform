interface IProjectStoreResponse {
	error?: unknown;
}

export interface IProjectStore {
	projectId?: string;
	fileName: string;
	projectUpdateCount: number;
	resources: Record<string, Uint8Array>;
	loadProject: (projectId: string) => Promise<IProjectStoreResponse>;
	setUpdateCount: () => void;
	setUpdateFileContent: (content: string) => void;
	setProjectResources: (file: File) => Promise<IProjectStoreResponse>;
	setProjectEmptyResources: (name: string) => Promise<IProjectStoreResponse>;
	getProjectResources: () => Promise<IProjectStoreResponse>;
}
