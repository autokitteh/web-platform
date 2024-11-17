import { Project } from "@type/models";
import { ServiceResponse } from "@type/services.types";

export interface ProjectStore {
	createProject: (name: string, isDefault?: boolean) => ServiceResponse<{ name: string; projectId: string }>;
	deleteProject: (projectId: string) => ServiceResponse<undefined>;
	getProject: (projectId: string) => ServiceResponse<Project>;
	getProjectsList: () => ServiceResponse<Project[]>;
	createProjectFromManifest: (manifest: string) => ServiceResponse<string>;
	projectsList: Project[];
	renameProject: (projectId: string, projectName: string) => void;
	isLoadingProjectsList: boolean;
	initialEditorWidth: number;
	setEditorWidth: (width: number) => void;
}
