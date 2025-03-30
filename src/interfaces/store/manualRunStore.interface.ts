import { SingleValue } from "react-select";

import { SelectOption } from "../components";
import { SessionEntrypoint } from "@src/interfaces/models";
import { ServiceResponse } from "@src/types";
import { Deployment } from "@src/types/models";

export interface ManualProjectData {
	files: Record<string, string[]>;
	filesSelectItems: SelectOption[];
	filePath: SingleValue<SelectOption>;
	entrypointFunction: SingleValue<SelectOption>;
	params: string;
	activeDeployment?: Deployment;
	selectedEntrypoint?: SessionEntrypoint;
	isManualRunEnabled?: boolean;
}

export interface ManualRunStore {
	projectManualRun: {
		[projectId: string]: ManualProjectData;
	};
	isJson: boolean;
	setIsJson: (isJson: boolean) => void;
	updateManualRunConfiguration: (projectId: string, updates: Partial<ManualProjectData>) => void;
	saveAndExecuteManualRun: (projectId: string, params?: string) => ServiceResponse<string>;
	fetchManualRunConfiguration: (projectId: string, preSelectRunValues?: boolean) => void;
}
