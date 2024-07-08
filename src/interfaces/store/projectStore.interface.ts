import { ProjectMenuItem } from "@type/models";
import { ServiceResponse } from "@type/services.types";

interface ProjectStoreResponse {
	data?: unknown;
	error?: unknown;
}
interface FilesResponse {
	error?: unknown;
	fileName?: string;
}

export interface ProjectStore {
	addProjectToMenu: (project: ProjectMenuItem) => void;
	createProject: () => ServiceResponse<{ name: string; projectId: string }>;
	getProject: (projectId: string) => ServiceResponse<ProjectMenuItem>;
	getProjectMenutItems: () => ServiceResponse<ProjectMenuItem[]>;
	getProjectResources: (resources: Record<string, Uint8Array>) => void;
	menuList: ProjectMenuItem[];
	openedFiles: { isActive: boolean; name: string }[];
	removeProjectFile: (fileName: string, projectId: string) => Promise<ProjectStoreResponse>;
	renameProject: (projectId: string, projectName: string) => void;
	reset: () => void;
	resources: Record<string, Uint8Array>;
	setProjectEmptyResources: (name: string, projectId: string) => Promise<ProjectStoreResponse>;
	setProjectResources: (files: File[], projectId: string) => Promise<FilesResponse>;
	setUpdateFileContent: (content: Uint8Array, projectId: string) => void;
	updateEditorClosedFiles: (fileName: string) => void;
	updateEditorOpenedFiles: (fileName: string) => void;
}
