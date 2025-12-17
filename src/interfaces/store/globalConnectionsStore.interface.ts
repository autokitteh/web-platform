import { Connection } from "@src/types/models";

export interface GlobalConnectionsState {
	globalConnections: Connection[];
	selectedGlobalConnectionId?: string;
	isLoading: boolean;
	error?: string;
	isDrawerOpen: boolean;
	isDrawerEditMode: boolean;
	isDrawerAddMode: boolean;
}

export interface GlobalConnectionsActions {
	setSelectedGlobalConnectionId: (id?: string) => void;
	fetchGlobalConnections: (orgId: string, force?: boolean) => Promise<Connection[]>;
	openDrawer: () => void;
	closeDrawer: () => void;
	setDrawerEditMode: (isEditMode: boolean) => void;
	setDrawerAddMode: (isAddMode: boolean) => void;
	resetDrawerState: () => void;
}
