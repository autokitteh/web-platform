import { Connection } from "@src/types/models";

export interface OrgConnectionsState {
	orgConnections: Connection[];
	selectedOrgConnectionId?: string;
	isLoading: boolean;
	error?: string;
	isDrawerOpen: boolean;
	isDrawerEditMode: boolean;
	isDrawerAddMode: boolean;
}

export interface OrgConnectionsActions {
	setSelectedOrgConnectionId: (id?: string) => void;
	fetchOrgConnections: (orgId: string, force?: boolean) => Promise<Connection[]>;
	openDrawer: () => void;
	closeDrawer: () => void;
	setDrawerEditMode: (isEditMode: boolean) => void;
	setDrawerAddMode: (isAddMode: boolean) => void;
	resetDrawerState: () => void;
}
