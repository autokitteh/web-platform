import { Entity, EntityAction } from "@src/types";

export interface ConnectionsProps {
	onOperation: (type: Entity, action: EntityAction, id?: string) => void;
	isLoading?: boolean;
}

export interface TriggersProps {
	onOperation: (type: Entity, action: EntityAction, id?: string) => void;
	isLoading?: boolean;
}

export interface VariablesProps {
	onOperation: (type: Entity, action: EntityAction, id?: string) => void;
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
