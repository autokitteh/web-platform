import { Connection } from "@src/types/models";

export interface GlobalConnectionsState {
	globalConnections: Connection[];
	selectedGlobalConnectionId?: string;
	isLoading: boolean;
	error?: string;
}

export interface GlobalConnectionsActions {
	setSelectedGlobalConnectionId: (id?: string) => void;
	fetchGlobalConnections: (orgId: string, force?: boolean) => Promise<Connection[]>;
}
