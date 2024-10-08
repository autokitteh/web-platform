import { ServiceResponse } from "@src/types";
import { Deployment, SessionEntrypoint } from "@src/types/models";

export interface ManualProjectData {
	files: Record<string, SessionEntrypoint[]>;
	fileOptions: { label: string; value: string }[];
	filePath: { label: string; value: string };
	entrypointFunction: string;
	params: { key: string; value: string }[];
	lastDeployment?: Deployment;
	selectedEntrypoint?: SessionEntrypoint;
}

export interface ManualRunStore {
	projectManualRun: {
		[projectId: string]: ManualProjectData;
	};
	updateProjectManualRun: (projectId: string, updates: Partial<ManualProjectData>, isInitialLoad: boolean) => void;
	saveProjectManualRun: (projectId: string, params?: { key: string; value: string }[]) => ServiceResponse<string>;
}
