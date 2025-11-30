import { Connection } from "@src/types/models";

export interface GlobalConnectionsState {
	globalConnections: Connection[];
	selectedGlobalConnectionId?: string;
	isLoading: boolean;
	error?: string;
	isDrawerEditMode: boolean;
}

export interface GlobalConnectionsActions {
	setSelectedGlobalConnectionId: (id?: string) => void;
	fetchGlobalConnections: (orgId: string, force?: boolean) => Promise<Connection[]>;
	setDrawerEditMode: (isEditMode: boolean) => void;
	resetDrawerState: () => void;
}
