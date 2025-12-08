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
	onXcloseGoBack?: boolean;
	isDrawerMode: boolean;
	onSuccess?: () => void;
	isGlobalConnection: boolean;
}

export interface AddConnectionProps {
	onBack?: () => void;
	isDrawerMode: boolean;
	onSuccess?: () => void;
	isGlobalConnection: boolean;
}

export interface AddTriggerProps {
	onBack?: () => void;
}

export interface EditTriggerProps {
	triggerId?: string;
	onSuccess?: () => void;
	onBack?: () => void;
}

export interface AddVariableProps {
	onBack?: () => void;
}

export interface EditVariableProps {
	variableName?: string;
	onBack?: () => void;
}

export interface IntegrationAddFormProps {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
	type?: string;
	onSuccess?: () => void;
	isGlobalConnection?: boolean;
}
