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
	| "setCurrentOrganization"
	| "listMembers"
	| "removeMember"
	| "reset"
> = {
	organizationsList: undefined,
	membersList: undefined,
	currentOrganization: undefined,
	isLoadingOrganizations: false,
	isLoadingMembers: false,
};

const store: StateCreator<OrganizationStore> = (set, get) => ({
	...defaultState,

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
					ns: "settings.organization.store.errors",
				})
			);
		}

		const { data: organizations, error } = await OrganizationsService.list(userId);

		if (error) {
			set((state) => ({ ...state, isLoadingOrganizations: false, organizationsList: [] }));

			return error;
		}

		if (isEqual(organizations, organizationsList)) {
			set((state) => ({ ...state, isLoadingOrganizations: false }));

			return undefined;
		}

		set((state) => ({ ...state, organizationsList: organizations, isLoadingOrganizations: false }));

		return undefined;
	},

	listMembers: async () => {
		set((state) => ({ ...state, isLoadingMembers: true }));
		const organizationId = get().currentOrganization?.id;

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
		const organizationId = get().currentOrganization?.id;

		const { error } = await OrganizationsService.inviteMember(organizationId!, email);

		if (error) {
			return error;
		}

		await get().listMembers();
	},

	removeMember: async (email) => {
		const organizationId = get().currentOrganization?.id;

		const { error } = await OrganizationsService.inviteMember(organizationId!, email);

		if (error) {
			return error;
		}

		await get().listMembers();
	},

	setCurrentOrganization: async (organization) => {
		set((state) => ({ ...state, currentOrganization: organization }));
	},
});

export const useOrganizationStore = create(persist(immer(store), { name: StoreName.organization }));
