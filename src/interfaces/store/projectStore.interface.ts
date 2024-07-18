import { Project } from "@type/models";
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
	addProjectToMenu: (project: Project) => void;
	createProject: () => ServiceResponse<{ name: string; projectId: string }>;
	getProject: (projectId: string) => ServiceResponse<Project>;
	getProjectsList: () => ServiceResponse<Project[]>;
	getProjectResources: (resources: Record<string, Uint8Array>) => void;
	projectsList: Project[];
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
