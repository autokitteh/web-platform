import { Project } from "@type/models";
import { ServiceResponse } from "@type/services.types";

export interface ProjectStore {
	createProject: (name: string, isDefault?: boolean) => ServiceResponse<{ name: string; projectId: string }>;
	deleteProject: (projectId: string) => ServiceResponse<undefined>;
	getProject: (projectId: string) => ServiceResponse<Project>;
	getProjectsList: () => ServiceResponse<Project[]>;
	createProjectFromManifest: (manifest: string) => ServiceResponse<string>;
	projectsList: Project[];
	latestOpenedTab: string;
	renameProject: (projectId: string, projectName: string) => void;
	setLatestOpenedTab: (tab: string) => void;
	isLoadingProjectsList: boolean;
	initialEditorWidth: number;
	pendingFile?: File;
	setPendingFile: (file?: File) => void;
	setEditorWidth: (width: number) => void;
}
