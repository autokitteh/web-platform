import { Project } from "@type/models";
import { ServiceResponse } from "@type/services.types";

export interface ProjectStore {
	createProject: (name: string, isDefault?: boolean) => ServiceResponse<{ name: string; projectId: string }>;
	deleteProject: (projectId: string) => ServiceResponse<undefined>;
	getProject: (projectId: string) => ServiceResponse<Project>;
	exportProject: (projectId: string) => ServiceResponse<Uint8Array>;
	getProjectsList: () => ServiceResponse<Project[]>;
	createProjectFromManifest: (manifest: string) => ServiceResponse<string>;
	projectsList: Project[];
	currentProjectId?: string;
	latestOpenedTab: string;
	latestOpenedDeploymentId?: string;
	renameProject: (projectId: string, projectName: string) => void;
	setLatestOpenedTab: (tab: string) => void;
	setLatestOpenedDeploymentId: (deploymentId: string, projectId: string) => void;
	isLoadingProjectsList: boolean;
	initialEditorWidth: number;
	pendingFile?: File;
	setPendingFile: (file?: File) => void;
	setEditorWidth: (width: number) => void;
	isExporting: boolean;
}
