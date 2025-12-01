import { create } from "zustand";
import { persist } from "zustand/middleware";

import { GlobalConnectionsState, GlobalConnectionsStore } from "@interfaces/store";
import { ConnectionService } from "@services";

const initialState: GlobalConnectionsState = {
	globalConnections: [],
	selectedGlobalConnectionId: undefined,
	isLoading: false,
	error: undefined,
	isDrawerOpen: false,
	isDrawerEditMode: false,
	isDrawerAddMode: false,
};

export const useGlobalConnectionsStore = create<GlobalConnectionsStore>()(
	persist(
		(set) => ({
			...initialState,

			setSelectedGlobalConnectionId: (id?: string) => {
				set({ selectedGlobalConnectionId: id, isDrawerEditMode: !!id });
			},

			openDrawer: () => {
				set({ isDrawerOpen: true });
			},

			closeDrawer: () => {
				set({
					isDrawerOpen: false,
					selectedGlobalConnectionId: undefined,
					isDrawerEditMode: false,
					isDrawerAddMode: false,
				});
			},

			setDrawerEditMode: (isEditMode: boolean) => {
				set({ isDrawerEditMode: isEditMode });
			},

			setDrawerAddMode: (isAddMode: boolean) => {
				set({ isDrawerAddMode: isAddMode });
			},

			resetDrawerState: () => {
				set({
					isDrawerOpen: false,
					selectedGlobalConnectionId: undefined,
					isDrawerEditMode: false,
					isDrawerAddMode: false,
				});
			},

			fetchGlobalConnections: async (orgId: string) => {
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
		}),
		{
			name: "global-connections-storage",
			partialize: (state) => ({
				selectedGlobalConnectionId: state.selectedGlobalConnectionId,
			}),
		}
	)
);
