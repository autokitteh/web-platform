import { SingleValue } from "react-select";
"@type
import { SelectOption } from "../components";
import { SessionEntrypoint } from "@interfaces/models";
import { ServiceResponse } from "@type";
import { Deployment } from "@type/models";

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
	fetchManualRunConfiguration: (projectId: string, preSelectRunValues?: string) => void;
}
