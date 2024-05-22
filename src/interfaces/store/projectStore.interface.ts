import { Environment, Trigger } from "@type/models";
import { Variable } from "@type/models";

interface ProjectStoreResponse {
	error?: unknown;
	data?: unknown;
}
interface FilesResponse {
	error?: unknown;
	fileName?: string;
}

type ProjectList = { id: string; name: string; href: string };

export interface ProjectStore {
	list: ProjectList[];
	activeTab?: string;
	currentProject: {
		projectId?: string;
		openedFiles: { name: string; isActive: boolean }[];
		resources: Record<string, Uint8Array>;
		environments: Environment[];
		variables: Variable[];
		triggers: Trigger[];
		activeModifyVariable?: { name: string; value: string };
	};
	loadProject: (projectId: string) => Promise<ProjectStoreResponse>;
	getProjectsList: () => Promise<ProjectStoreResponse & { list: ProjectList[] }>;
	setActiveTab: (value: string) => void;
	setUpdateFileContent: (content: Uint8Array) => void;
	setProjectResources: (files: File[]) => Promise<FilesResponse>;
	setProjectEmptyResources: (name: string) => Promise<ProjectStoreResponse>;
	getProjectResources: (resources: Record<string, Uint8Array>) => void;
	getProjecEnvironments: () => Promise<ProjectStoreResponse>;
	getProjectVariables: () => Promise<ProjectStoreResponse>;
	getProjectTriggers: () => Promise<ProjectStoreResponse>;
	updateEditorOpenedFiles: (fileName: string) => void;
	updateEditorClosedFiles: (fileName: string) => void;
	removeProjectFile: (fileName: string) => Promise<ProjectStoreResponse>;
}
