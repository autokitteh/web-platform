import { ProjectMenuItem } from "@type/models";
import { ServiceResponse } from "@type/services.types";

interface ProjectStoreResponse {
	error?: unknown;
	data?: unknown;
}
interface FilesResponse {
	error?: unknown;
	fileName?: string;
}

export interface ProjectStore {
	list: ProjectMenuItem[];
	activeTab?: string;
	currentProject: {
		openedFiles: { name: string; isActive: boolean }[];
		resources: Record<string, Uint8Array>;
	};
	getProjectMenutItems: () => ServiceResponse<ProjectMenuItem[]>;
	getProject: (projectId: string) => ServiceResponse<ProjectMenuItem>;
	addProjectToMenu: (project: ProjectMenuItem) => void;
	setActiveTab: (value: string) => void;
	createProject: () => ServiceResponse<{ id: string; name: string }>;
	setUpdateFileContent: (content: Uint8Array, projectId: string) => void;
	setProjectResources: (files: File[], projectId: string) => Promise<FilesResponse>;
	setProjectEmptyResources: (name: string, projectId: string) => Promise<ProjectStoreResponse>;
	getProjectResources: (resources: Record<string, Uint8Array>) => void;
	updateEditorOpenedFiles: (fileName: string) => void;
	updateEditorClosedFiles: (fileName: string) => void;
	resetResources: () => void;
	reset: () => void;
	removeProjectFile: (fileName: string, projectId: string) => Promise<ProjectStoreResponse>;
}
