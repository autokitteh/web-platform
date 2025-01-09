import i18n from "i18next";
import isEqual from "lodash/isEqual";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { OrganizationStore } from "@interfaces/store";
import { OrganizationsService } from "@services";
import { useUserStore } from "@store/useUserStore";

const defaultState: Omit<OrganizationStore, "createOrganization" | "getOrganizationsList"> = {
	organizationsList: undefined,
	currentOrganizationId: undefined,
	isLoadingOrganizations: false,
};

const store: StateCreator<OrganizationStore> = (set, get) => ({
	...defaultState,

	createOrganization: async (name: string) => {
		const { data: organizationId, error } = await OrganizationsService.create(name);

		if (error) {
			return error;
		}
		if (!organizationId) {
			return i18n.t("createFailed", {
				ns: "settings.organization.store.errors",
			});
		}

		const menuItem = {
			id: organizationId,
			displayName: name,
		};

		set((state) => {
			const newOrganizationsList = state.organizationsList || [];
			newOrganizationsList.push(menuItem);
			state.organizationsList = newOrganizationsList;

			return state;
		});

		return undefined;
	},

	getOrganizationsList: async () => {
		const organizationsList = get().organizationsList;
		set((state) => ({ ...state, isLoadingOrganizations: true }));

		const userId = useUserStore.getState().user?.id;

		if (!userId) {
			set((state) => ({ ...state, isLoadingOrganizationsList: false, organizationsList: [] }));

			return new Error(
				i18n.t("userNotFound", {
					ns: "organizations.errors",
				})
			);
		}

		const { data: organizations, error } = await OrganizationsService.list(userId);

		if (error) {
			set((state) => ({ ...state, isLoadingOrganizationsList: false, organizationsList: [] }));

			return error;
		}

		if (isEqual(organizations, organizationsList)) {
			set((state) => ({ ...state, isLoadingOrganizationsList: false }));

			return undefined;
		}

		set((state) => ({ ...state, organizationsList: organizations, isLoadingOrganizationsList: false }));

		return undefined;
	},
});

export const useOrganizationStore = create(persist(immer(store), { name: StoreName.organization }));
