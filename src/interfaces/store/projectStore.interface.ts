import { ProjectActionType } from "@src/types/components";
import { Project } from "@type/models";
import { ServiceResponse } from "@type/services.types";

export interface ProjectStore {
	createProject: (name: string, isDefault?: boolean) => ServiceResponse<{ name: string; projectId: string }>;
	deleteProject: (projectId: string) => ServiceResponse<string>;
	getProject: (projectId: string) => ServiceResponse<Project>;
	isProjectNameTaken: (name: string) => boolean;
	exportProject: (projectId: string) => ServiceResponse<Uint8Array>;
	getProjectsList: () => ServiceResponse<Project[]>;
	createProjectFromManifest: (manifest: string) => ServiceResponse<string>;
	projectsList: Project[];
	currentProjectId?: string;
	renameProject: (projectId: string, projectName: string) => void;
	isLoadingProjectsList: boolean;
	pendingFile?: File;
	setPendingFile: (file?: File) => void;
	isExporting: boolean;
	setIsExporting: (value: boolean) => void;
	isDeleting: boolean;
	setIsDeleting: (value: boolean) => void;
	loadingImportFile: boolean;
	setLoadingImportFile: (value: boolean) => void;
	actionInProcess: Record<ProjectActionType, boolean>;
	setActionInProcess: (action: ProjectActionType, value: boolean) => void;
}
