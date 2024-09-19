export type ProjectValidationLevel = "error" | "warning";

export interface ProjectValidationStore {
	currentProjectId: string | undefined;
	projectValidationState: {
		code: {
			level?: ProjectValidationLevel;
			message?: string;
		};
		connections: {
			level?: ProjectValidationLevel;
			message?: string;
		};
		triggers: {
			level?: ProjectValidationLevel;
			message?: string;
		};
	};
	checkState: (projectId: string, enforce?: boolean) => void;
	isValid: boolean;
	totalErrors: number;
	totalWarnings: number;
}
