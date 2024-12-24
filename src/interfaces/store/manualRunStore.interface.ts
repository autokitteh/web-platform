import { SessionEntrypoint } from "@src/interfaces/models";
import { ServiceResponse } from "@src/types";
import { Deployment } from "@src/types/models";

export interface ManualProjectData {
	files: Record<string, string[]>;
	fileOptions: { label: string; value: string }[];
	filePath: { label: string; value: string };
	entrypointFunction: { label: string; value: string };
	params: { key: string; value: string }[];
	isJson: boolean;
	activeDeployment?: Deployment;
	selectedEntrypoint?: SessionEntrypoint;
	isManualRunEnabled?: boolean;
}

export interface ManualRunStore {
	projectManualRun: {
		[projectId: string]: ManualProjectData;
	};
	updateManualRunConfiguration: (projectId: string, updates: Partial<ManualProjectData>) => void;
	saveAndExecuteManualRun: (projectId: string, params?: { key: string; value: string }[]) => ServiceResponse<string>;
	fetchManualRunConfiguration: (projectId: string) => void;
}
