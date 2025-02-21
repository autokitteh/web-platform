import { Project } from "@type/models";
import { ServiceResponse } from "@type/services.types";

type LatestOpened = {
	deploymentId: string;
	projectId?: string;
	tab: string;
};

export interface ProjectStore {
	createProject: (name: string, isDefault?: boolean) => ServiceResponse<{ name: string; projectId: string }>;
	deleteProject: (projectId: string) => ServiceResponse<undefined>;
	getProject: (projectId: string) => ServiceResponse<Project>;
	exportProject: (projectId: string) => ServiceResponse<Uint8Array>;
	getProjectsList: () => ServiceResponse<Project[]>;
	createProjectFromManifest: (manifest: string) => ServiceResponse<string>;
	projectsList: Project[];
	currentProjectId?: string;
	latestOpened: LatestOpened;
	renameProject: (projectId: string, projectName: string) => void;
	isLoadingProjectsList: boolean;
	initialEditorWidth: {
		assets: number;
		sessions: number;
	};
	pendingFile?: File;
	setPendingFile: (file?: File) => void;
	setEditorWidth: ({ assets, sessions }: { assets?: number; sessions?: number }) => void;
	isExporting: boolean;
	setLatestOpened: (type: keyof Omit<LatestOpened, "projectId">, value: string, projectId?: string) => void;
}
