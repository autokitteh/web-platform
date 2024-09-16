export interface ProjectValidationStore {
	currentProjectId: string | undefined;
	projectValidationState: {
		code: string;
		connections: string;
		triggers: string;
		variables: string;
	};
	checkState: (projectId: string, enforce?: boolean) => void;
	isValid: boolean;
	totalErrors: number;
}
