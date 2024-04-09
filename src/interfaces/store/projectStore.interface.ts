import { TEnvironment } from "@type/models";
import { TVariable } from "@type/models";

interface IProjectStoreResponse {
	error?: unknown;
	data?: unknown;
}
interface IFilesResponse {
	error?: unknown;
	fileName?: string;
}

type TProjectList = { id: string; name: string; href: string };

type TProjectModifyVariable = { name: string; value: string };

export interface IProjectStore {
	list: TProjectList[];
	activeTab?: string;
	currentProject: {
		projectId?: string;
		activeEditorFileName: string;
		resources: Record<string, Uint8Array>;
		environments: TEnvironment[];
		variables: TVariable[];
		activeModifyVariable?: TProjectModifyVariable;
	};
	loadProject: (projectId: string) => Promise<IProjectStoreResponse>;
	getProjectsList: () => Promise<IProjectStoreResponse & { list: TProjectList[] }>;
	setActiveTab: (value: string) => void;
	setUpdateFileContent: (content: Uint8Array) => void;
	setProjectResources: (files: File[]) => Promise<IFilesResponse>;
	setProjectEmptyResources: (name: string) => Promise<IProjectStoreResponse>;
	getProjectResources: () => Promise<IProjectStoreResponse>;
	updateActiveEditorFileName: (fileName: string) => void;
	getProjectEnvironments: () => Promise<IProjectStoreResponse>;
	getProjectVariables: () => Promise<IProjectStoreResponse>;
	setProjectModifyVariable: (name: string, value: string) => void;
}
