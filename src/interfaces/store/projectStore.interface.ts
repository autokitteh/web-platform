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
	menuList: ProjectMenuItem[];
	openedFiles: { name: string; isActive: boolean }[];
	resources: Record<string, Uint8Array>;
	getProjectMenutItems: () => ServiceResponse<ProjectMenuItem[]>;
	getProject: (projectId: string) => ServiceResponse<ProjectMenuItem>;
	renameProject: (projectId: string, projectName: string) => void;
	addProjectToMenu: (project: ProjectMenuItem) => void;
	createProject: () => ServiceResponse<{ projectId: string; name: string }>;
	setUpdateFileContent: (content: Uint8Array, projectId: string) => void;
	setProjectResources: (files: File[], projectId: string) => Promise<FilesResponse>;
	setProjectEmptyResources: (name: string, projectId: string) => Promise<ProjectStoreResponse>;
	getProjectResources: (resources: Record<string, Uint8Array>) => void;
	updateEditorOpenedFiles: (fileName: string) => void;
	updateEditorClosedFiles: (fileName: string) => void;
	reset: () => void;
	removeProjectFile: (fileName: string, projectId: string) => Promise<ProjectStoreResponse>;
}
