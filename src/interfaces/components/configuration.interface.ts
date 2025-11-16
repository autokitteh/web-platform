export interface ConnectionsProps {
	isLoading?: boolean;
}

export interface TriggersProps {
	isLoading?: boolean;
}

export interface VariablesProps {
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

export interface EditVariableProps {
	variableName?: string;
}
