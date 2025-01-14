import i18n from "i18next";
import isEqual from "lodash/isEqual";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { OrganizationStore } from "@interfaces/store";
import { OrganizationsService } from "@services";
import { useUserStore } from "@store/useUserStore";

const defaultState: Omit<
	OrganizationStore,
	| "createOrganization"
	| "getOrganizationsList"
	| "inviteMember"
	| "setCurrentOrganizationId"
	| "listMembers"
	| "removeMember"
	| "reset"
	| "getCurrentOrganizationId"
> = {
	organizationsList: undefined,
	membersList: undefined,
	currentOrganizationId: undefined,
	isLoadingOrganizations: false,
	isLoadingMembers: false,
};

const store: StateCreator<OrganizationStore> = (set, get) => ({
	...defaultState,

	setCurrentOrganizationId: (organizationId: string) => {
		set((state) => {
			state.currentOrganizationId = organizationId;

			return state;
		});
	},
	reset: () => set(defaultState),

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
			orgId: organizationId,
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
					ns: "settings.organization.store.errors",
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

	listMembers: async () => {
		set((state) => ({ ...state, isLoadingMembers: true }));

		const organizationId = get().currentOrganizationId;
		if (!organizationId) {
			set((state) => ({ ...state, isLoadingMembers: false }));

			return new Error(
				i18n.t("organizationIdNotFound", {
					ns: "settings.organization.store.errors",
				})
			);
		}
		const { data: members, error } = await OrganizationsService.listMembers(organizationId);

		if (error) {
			set((state) => ({ ...state, isLoadingMembers: false }));

			return error;
		}
		set((state) => ({ ...state, membersList: members, isLoadingMembers: false }));
	},

	inviteMember: async (email) => {
		const organizationId = get().currentOrganizationId;

		const { error } = await OrganizationsService.inviteMember(organizationId!, email);

		if (error) {
			return error;
		}

		await get().listMembers();
	},

	removeMember: async (email) => {
		const organizationId = get().currentOrganizationId;

		const { error } = await OrganizationsService.inviteMember(organizationId!, email);

		if (error) {
			return error;
		}

		await get().listMembers();
	},

	getCurrentOrganizationId: async (currentOrganizationId) => {
		set((state) => ({ ...state, currentOrganizationId }));
	},
});

export const useOrganizationStore = create(persist(immer(store), { name: StoreName.organization }));
