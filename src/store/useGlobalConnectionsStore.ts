import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ConnectionService } from "@services";
import { Connection } from "@type/models";

export interface GlobalConnectionsState {
	connections: Connection[];
	selectedConnectionId?: string;
	isLoading: boolean;
	error?: string;
}

export interface GlobalConnectionsActions {
	setSelectedConnectionId: (id?: string) => void;
	fetchConnections: (orgId: string, force?: boolean) => Promise<Connection[]>;
	resetState: () => void;
	clearError: () => void;
}

export type GlobalConnectionsStore = GlobalConnectionsState & GlobalConnectionsActions;

const initialState: GlobalConnectionsState = {
	connections: [],
	selectedConnectionId: undefined,
	isLoading: false,
	error: undefined,
};

export const useGlobalConnectionsStore = create<GlobalConnectionsStore>()(
	persist(
		(set, get) => ({
			...initialState,

			setSelectedConnectionId: (id?: string) => {
				set({ selectedConnectionId: id });
			},

			fetchConnections: async (orgId: string, force?: boolean) => {
				const currentConnections = get().connections;
				if (!force && currentConnections.length > 0) {
					return currentConnections;
				}

				set({ isLoading: true, error: undefined });

				const { data: connections, error } = await ConnectionService.listByOrg(orgId);

				if (error) {
					set({
						isLoading: false,
						error: typeof error === "string" ? error : (error as Error).message,
					});
					return [];
				}

				set({
					connections: connections || [],
					isLoading: false,
					error: undefined,
				});

				return connections || [];
			},

			resetState: () => {
				set(initialState);
			},

			clearError: () => {
				set({ error: undefined });
			},
		}),
		{
			name: "global-connections-storage",
			partialize: (state) => ({
				selectedConnectionId: state.selectedConnectionId,
			}),
		}
	)
);
