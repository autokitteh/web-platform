import { ProjectsMenuList } from "@type/models";

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
		openedFiles: { name: string; isActive: boolean }[];
		resources: Record<string, Uint8Array>;
	};
	getProjectsList: () => Promise<ProjectStoreResponse & { list: ProjectsMenuList }>;
	setActiveTab: (value: string) => void;
	setUpdateFileContent: (content: Uint8Array, projectId: string) => void;
	setProjectResources: (files: File[], projectId: string) => Promise<FilesResponse>;
	setProjectEmptyResources: (name: string, projectId: string) => Promise<ProjectStoreResponse>;
	getProjectResources: (resources: Record<string, Uint8Array>) => void;
	updateEditorOpenedFiles: (fileName: string) => void;
	updateEditorClosedFiles: (fileName: string) => void;
	resetResources: () => void;
	removeProjectFile: (fileName: string, projectId: string) => Promise<ProjectStoreResponse>;
}
