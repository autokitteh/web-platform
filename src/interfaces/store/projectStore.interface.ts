import { Project } from "@type/models";
import { ServiceResponse } from "@type/services.types";

export interface ProjectStore {
	createProject: () => ServiceResponse<{ name: string; projectId: string }>;
	deleteProject: (projectId: string) => ServiceResponse<undefined>;
	getProject: (projectId: string) => ServiceResponse<Project>;
	getProjectsList: () => ServiceResponse<Project[]>;
	projectsList: Project[];
	renameProject: (projectId: string, projectName: string) => void;
	reset: () => void;
}
