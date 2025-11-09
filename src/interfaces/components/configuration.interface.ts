import { ProjectValidationLevel } from "@src/types";

export interface ConnectionsProps {
	onOperation: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
	isLoading?: boolean;
}

export interface TriggersProps {
	onOperation: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
	isLoading?: boolean;
}

export interface VariablesProps {
	onOperation: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
	isLoading?: boolean;
}

export interface EditConnectionProps {
	connectionId?: string;
	onBack?: () => void;
}

export interface EditTriggerProps {
	triggerId?: string;
	onSuccess?: () => void;
	onBack?: () => void;
}

export interface AddVariableProps {
	onSuccess?: () => void;
	onBack?: () => void;
}

export interface EditVariableProps {
	variableName?: string;
	onSuccess?: () => void;
	onBack?: () => void;
}
