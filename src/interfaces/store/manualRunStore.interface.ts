import { ServiceResponse } from "@src/types";
import { Deployment, SessionEntrypoint } from "@src/types/models";

export interface ManualProjectData {
	files: string[];
	fileOptions: { label: string; value: string }[];
	filePath: { label: string; value: string };
	entrypointFunction: string;
	params: { key: string; value: string }[];
	isJson: boolean;
	lastDeployment?: Deployment;
	selectedEntrypoint?: SessionEntrypoint;
	isManualRunEnabled?: boolean;
}

export interface ManualRunStore {
	projectManualRun: {
		[projectId: string]: ManualProjectData;
	};
	updateManualRunConfiguration: (projectId: string, updates: Partial<ManualProjectData>) => void;
	saveAndExecuteManualRun: (projectId: string, params?: { key: string; value: string }[]) => ServiceResponse<string>;
}
