import { create } from "zustand";
import { persist } from "zustand/middleware";

import { OrgConnectionsState, OrgConnectionsStore } from "@interfaces/store";
import { ConnectionService } from "@services";

const initialState: OrgConnectionsState = {
	orgConnections: [],
	selectedOrgConnectionId: undefined,
	isLoading: false,
	error: undefined,
	isDrawerOpen: false,
	isDrawerEditMode: false,
	isDrawerAddMode: false,
};

export const useOrgConnectionsStore = create<OrgConnectionsStore>()(
	persist(
		(set) => ({
			...initialState,

			setSelectedOrgConnectionId: (id?: string) => {
				set({ selectedOrgConnectionId: id, isDrawerEditMode: !!id });
			},

			openDrawer: () => {
				set({ isDrawerOpen: true });
			},

			closeDrawer: () => {
				set({
					isDrawerOpen: false,
					selectedOrgConnectionId: undefined,
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
					selectedOrgConnectionId: undefined,
					isDrawerEditMode: false,
					isDrawerAddMode: false,
				});
			},

			fetchOrgConnections: async (orgId: string) => {
				set({ isLoading: true, error: undefined });

				const { data: orgConnections, error } = await ConnectionService.listGlobalByOrg(orgId);

				if (error) {
					set({
						isLoading: false,
						error: typeof error === "string" ? error : (error as Error).message,
					});
					return [];
				}

				set({
					orgConnections: orgConnections || [],
					isLoading: false,
					error: undefined,
				});

				return orgConnections || [];
			},
		}),
		{
			name: "org-connections-storage",
			partialize: (state) => ({
				selectedOrgConnectionId: state.selectedOrgConnectionId,
			}),
		}
	)
);
