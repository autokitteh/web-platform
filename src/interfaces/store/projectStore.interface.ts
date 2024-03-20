interface IProjectStoreResponse {
	error?: unknown;
}

type TProjectList = {
	id: string;
	name: string;
	href: string;
};

export interface IProjectStore {
	list: TProjectList[];
	activeTab?: string | number;
	currentProject: {
		projectId?: string;
		activeEditorFileName: string;
		resources: Record<string, Uint8Array>;
	};
	loadProject: (projectId: string) => Promise<IProjectStoreResponse>;
	getProjectsList: () => Promise<IProjectStoreResponse & { list: TProjectList[] }>;
	setActiveTab: (value: string | number) => void;
	setUpdateFileContent: (content: Uint8Array) => void;
	setProjectResources: (file: File) => Promise<IProjectStoreResponse>;
	setProjectEmptyResources: (name: string) => Promise<IProjectStoreResponse>;
	getProjectResources: () => Promise<IProjectStoreResponse>;
}
