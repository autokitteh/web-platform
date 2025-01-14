import i18n from "i18next";
import isEqual from "lodash/isEqual";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName, UserStatusType } from "@enums";
import { OrganizationStore } from "@interfaces/store";
import { OrganizationsService } from "@services";

import { useToastStore, useUserStore } from "@store";

const defaultState: Omit<
	OrganizationStore,
	| "createOrganization"
	| "getOrganizationsList"
	| "inviteMember"
	| "setCurrentOrganization"
	| "listMembers"
	| "deleteMember"
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
			return { data: undefined, error };
		}

		if (!organizationId) {
			return {
				data: undefined,
				error: i18n.t("createFailed", {
					ns: "settings.organization.store.errors",
				}),
			};
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

		return { data: organizationId, error: undefined };
	},

	getOrganizationsList: async () => {
		const organizationsList = get().organizationsList;
		set((state) => ({ ...state, isLoadingOrganizations: true }));

		const userId = useUserStore.getState().user?.id;

		if (!userId) {
			set((state) => ({ ...state, isLoadingOrganizationsList: false, organizationsList: [] }));

			return {
				data: undefined,
				error: new Error(
					i18n.t("userNotFound", {
						ns: "settings.organization.store.errors",
					})
				),
			};
		}

		const { data: organizations, error } = await OrganizationsService.list(userId);

		if (error) {
			set((state) => ({ ...state, isLoadingOrganizations: false, organizationsList: [] }));

			return { data: undefined, error };
		}

		if (isEqual(organizations, organizationsList)) {
			set((state) => ({ ...state, isLoadingOrganizations: false }));

			return { data: organizations, error: undefined };
		}

		set((state) => ({ ...state, organizationsList: organizations, isLoadingOrganizations: false }));

		return { data: organizations, error: undefined };
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
		let userId;

		const { data: existingUser } = await useUserStore.getState().getUser({ email });

		if (existingUser) {
			userId = existingUser.id;
		} else {
			const { data: createUserId, error: userCreationError } = await useUserStore
				.getState()
				.createUser(email, UserStatusType.invited);

			if (userCreationError) {
				return userCreationError;
			}
			userId = createUserId;
		}

		const { error } = await OrganizationsService.inviteMember(organizationId!, userId!);

		if (error) {
			const errorMessage = i18n.t("invitingMemberToOrganizationFailed", {
				ns: "settings.organization.store.errors",
			});

			useToastStore.getState().addToast({
				message: errorMessage,
				type: "error",
			});
			return errorMessage;
		}

		get().listMembers();
	},

	deleteMember: async (userId) => {
		const organizationId = get().currentOrganization?.id;

		const { error } = await OrganizationsService.deleteMember(organizationId!, userId);

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
