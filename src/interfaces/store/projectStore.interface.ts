interface IProjectStoreResponse {
	error?: unknown;
}

export interface IProjectStore {
	resources?: Record<string, Uint8Array>;
	projectId?: string;
	activeFile?: string;
	projectUpdateCount: number;
	setUpdateContent: (content?: string) => void;
	setProjectResources: (fileOrName: File | string, projectId: string) => Promise<IProjectStoreResponse>;
	getProjectResources: (projectId: string) => Promise<IProjectStoreResponse>;
}
