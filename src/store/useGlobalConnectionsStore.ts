import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ConnectionService } from "@services";
import { Connection } from "@type/models";

export interface GlobalConnectionsState {
	globalConnections: Connection[];
	selectedGlobalConnectionId?: string;
	isLoading: boolean;
	error?: string;
}

export interface GlobalConnectionsActions {
	setSelectedGlobalConnectionId: (id?: string) => void;
	fetchGlobalConnections: (orgId: string, force?: boolean) => Promise<Connection[]>;
	resetGlobalConnectionsState: () => void;
	clearGlobalConnectionsError: () => void;
}

export type GlobalConnectionsStore = GlobalConnectionsState & GlobalConnectionsActions;

const initialState: GlobalConnectionsState = {
	globalConnections: [],
	selectedGlobalConnectionId: undefined,
	isLoading: false,
	error: undefined,
};

export const useGlobalConnectionsStore = create<GlobalConnectionsStore>()(
	persist(
		(set, get) => ({
			...initialState,

			setSelectedGlobalConnectionId: (id?: string) => {
				set({ selectedGlobalConnectionId: id });
			},

			fetchGlobalConnections: async (orgId: string, force?: boolean) => {
				const currentConnections = get().globalConnections;
				if (!force && currentConnections.length > 0) {
					return currentConnections;
				}

				set({ isLoading: true, error: undefined });

				const { data: globalConnections, error } = await ConnectionService.listGlobalByOrg(orgId);

				if (error) {
					set({
						isLoading: false,
						error: typeof error === "string" ? error : (error as Error).message,
					});
					return [];
				}

				set({
					globalConnections: globalConnections || [],
					isLoading: false,
					error: undefined,
				});

				return globalConnections || [];
			},

			resetGlobalConnectionsState: () => {
				set(initialState);
			},

			clearGlobalConnectionsError: () => {
				set({ error: undefined });
			},
		}),
		{
			name: "global-connections-storage",
			partialize: (state) => ({
				selectedGlobalConnectionId: state.selectedGlobalConnectionId,
			}),
		}
	)
);
