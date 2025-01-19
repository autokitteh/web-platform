import i18n from "i18next";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName, UserStatusType } from "@enums";
import { AuthService, LoggerService, OrganizationsService, UsersService } from "@services";
import { namespaces } from "@src/constants";
import { OrganizationStore, OrganizationStoreState } from "@src/types/stores";

const defaultState: OrganizationStoreState = {
	organizations: {},
	members: {},
	users: {},
	user: undefined,
	currentOrganization: undefined,
	isLoading: {
		organizations: false,
		members: false,
		inviteMember: false,
		deleteMember: false,
	},
	logoutFunction: () => {},
};
const store: StateCreator<OrganizationStore> = (set, get) => ({
	...defaultState,

	getCurrentOrganizationEnriched: () => {
		const { currentOrganization, user } = get();
		if (!currentOrganization || !user) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				i18n.t("noMemberFound", {
					ns: "stores.organization",
					organizationId: currentOrganization?.id,
					userId: user?.id,
				})
			);
			return { error: true, data: undefined };
		}

		const organization = get().organizations[currentOrganization?.id];
		if (!organization) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				i18n.t("organizationNotFound", {
					ns: "stores.organization",
					organizationId: currentOrganization?.id,
				})
			);
			return { error: true, data: undefined };
		}

		const member = get().members[organization?.id]?.[user?.id];

		if (!member) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				i18n.t("noMemberFound", {
					ns: "stores.organization",
					organizationId: organization.id,
					userId: user?.id,
				})
			);
			return { error: true, data: undefined };
		}

		return {
			data: {
				...organization,
				currentMember: {
					role: member.role,
					status: member.status,
				},
			},
			error: false,
		};
	},

	getEnrichedOrganizations: () => {
		const { organizations, members, user, currentOrganization } = get();
		if (!user?.id || !currentOrganization || !Object.keys(organizations).length || !Object.keys(members).length) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				i18n.t("currentOrganizationInformationMissing", {
					ns: "stores.organization",
					organizationId: currentOrganization?.id,
					userId: user?.id,
					organizations: JSON.stringify(organizations),
					members: JSON.stringify(members),
				})
			);
			return { data: undefined, error: true };
		}

		const enrichedOrganizations = Object.values(organizations).map((organization) => {
			const currentMember = members[organization.id]?.[user?.id];
			if (!currentMember) {
				LoggerService.error(
					namespaces.stores.organizationStore,
					i18n.t("noMemberFound", {
						ns: "stores.organization",
						organizationId: organization.id,
						userId: user?.id,
					})
				);
				return undefined;
			}
			return {
				...organization,
				currentMember: {
					role: currentMember.role,
					status: currentMember.status,
				},
			};
		});
		const filteredOrganizations = enrichedOrganizations.filter((organization) => organization !== undefined);
		return { data: filteredOrganizations, error: enrichedOrganizations.length !== filteredOrganizations.length };
	},

	getEnrichedMembers: () => {
		const { currentOrganization } = get();
		if (!currentOrganization) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				i18n.t("noOrganizationFoundCantGetMembers", {
					ns: "stores.organization",
				})
			);
			return { data: undefined, error: true };
		}
		const members = get().members[currentOrganization.id];
		if (!members || !Object.keys(members).length) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				i18n.t("noMembersFound", {
					ns: "stores.organization",
					organizationId: currentOrganization.id,
				})
			);
			return { data: undefined, error: true };
		}
		return {
			data: Object.entries(members).map(([userId, member]) => ({
				...member,
				...get().users[userId],
			})),
			error: false,
		};
	},

	createOrganization: async (name: string) => {
		set((state) => ({ ...state, isLoading: { ...state.isLoading, organizations: true } }));
		const response = await OrganizationsService.create(name);

		if (!response.data) {
			set((state) => ({ ...state, isLoading: { ...state.isLoading, organizations: false } }));

			return {
				data: undefined,
				error: true,
			};
		}
		set((state) => ({ ...state, isLoading: { ...state.isLoading, organizations: false } }));

		await get().getOrganizations();

		return response;
	},

	deleteMember: async (userId: string) => {
		const organization = get().currentOrganization;
		if (!organization) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				i18n.t("noOrganizationFoundCantDeleteMember", {
					ns: "stores.organization",
					userId,
				})
			);
			return { data: undefined, error: true };
		}
		set((state) => ({ ...state, isLoading: { ...state.isLoading, deleteMember: true } }));

		const response = await OrganizationsService.deleteMember(organization.id, userId);

		set((state) => {
			const newMembers = { ...state.members };
			const newUsers = { ...state.users };
			delete newMembers[organization.id][userId];
			delete newUsers[userId];
			return {
				...state,
				members: newMembers,
				users: newUsers,
			};
		});
		set((state) => ({ ...state, isLoading: { ...state.isLoading, deleteMember: false } }));

		return response;
	},

	inviteMember: async (email: string) => {
		set((state) => ({ ...state, isLoading: { ...state.isLoading, inviteMember: true } }));
		const { data: user, error } = await UsersService.get({ email });
		const organization = get().currentOrganization;
		if (!organization) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				i18n.t("noOrganizationFoundCantInviteMember", {
					ns: "stores.organization",
					email,
				})
			);
			return { data: undefined, error: true };
		}
		if (!user) {
			const { data: userId, error: userCreateError } = await UsersService.create(email, UserStatusType.invited);
			if (userCreateError || !userId) {
				LoggerService.error(
					namespaces.stores.organizationStore,
					i18n.t("userNotCreatedCantInviteMember", {
						ns: "stores.organization",
						email,
					})
				);
				return { data: undefined, error };
			}
		}
		const response = await OrganizationsService.inviteMember(organization.id, email);
		set((state) => ({ ...state, isLoading: { ...state.isLoading, inviteMember: false } }));

		return response;
	},

	getOrganizations: async () => {
		set((state) => ({ ...state, isLoading: { ...state.isLoading, organizations: true } }));
		const { user } = get();
		if (!user) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				i18n.t("noUserFound", { ns: "stores.organization" })
			);
			set((state) => ({
				...state,
				organizations: undefined,
				isLoading: { ...state.isLoading, organizations: false },
			}));
			return { error: true, data: undefined };
		}
		const response = await OrganizationsService.list(user.id);

		if (
			response.error ||
			!Object.keys(response.data?.organizations || {}).length ||
			!Object.keys(response.data?.members || {}).length
		) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				i18n.t("organizationsAndMembersNotFound", {
					ns: "stores.organization",
					organizations: JSON.stringify(response.data?.organizations || {}),
					members: JSON.stringify(response.data?.members || {}),
				})
			);
			set((state) => ({
				...state,
				organizations: undefined,
				members: undefined,
			}));
			set((state) => ({ ...state, isLoading: { ...state.isLoading, organizations: false } }));
			return { error: true, data: undefined };
		}

		if (response.data) {
			const { organizations, members } = response.data;
			set((state) => ({
				...state,
				organizations,
				members,
			}));
		}

		set((state) => ({ ...state, isLoading: { ...state.isLoading, organizations: false } }));
		return { error: false, data: undefined };
	},

	getMembers: async () => {
		set((state) => ({ ...state, isLoading: { ...state.isLoading, members: true } }));
		const organization = get().currentOrganization;
		if (!organization) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				i18n.t("noOrganizationFoundCantFetchMembers", {
					ns: "stores.organization",
				})
			);
			return { data: undefined, error: true };
		}
		const response = await OrganizationsService.listMembers(organization.id);

		if (response.data) {
			const { users, members } = response.data;
			set((state) => ({
				...state,
				users,
				members,
			}));
		}

		set((state) => ({ ...state, isLoading: { ...state.isLoading, members: false } }));
		return { error: false, data: undefined };
	},

	setCurrentOrganization: (organization) => {
		set((state) => ({ ...state, currentOrganization: organization }));
	},

	reset: () => set(defaultState),

	createUser: async (email: string, status: UserStatusType) => {
		const { data: userId, error } = await UsersService.create(email, status);
		if (error) {
			return { data: undefined, error: i18n.t("organization.failedCreatingUser", { ns: "stores" }) };
		}
		return { data: userId, error: undefined };
	},

	login: async () => {
		const { data: user, error } = await AuthService.whoAmI();

		if (error) {
			return { error, data: undefined };
		}

		if (!user) {
			const errorMessage = i18n.t("organization.failedGettingLoggedInUser", {
				ns: "stores",
			});
			LoggerService.error(namespaces.stores.userStore, errorMessage);

			return { error: errorMessage, data: undefined };
		}

		set(() => ({ user }));

		const { error: errorOrganization } = await get().getOrganizations();

		const userOrganization = Object.values(get().organizations)?.find(
			(organization) => organization.id === user.defaultOrganizationId
		);

		if (errorOrganization || !userOrganization) {
			const errorMessage = i18n.t("organization.failedGettingLoggedInUserOrganization", {
				ns: "stores",
				userId: user.id,
			});
			LoggerService.error(namespaces.stores.userStore, errorMessage);
			return { data: undefined, error: true };
		}

		get().setCurrentOrganization(userOrganization);

		return { data: user, error: undefined };
	},
	logoutFunction: () => {},
	setLogoutFunction: (logoutFn) => {
		set((state) => ({
			...state,
			logoutFunction: logoutFn,
		}));
	},
});
export const useOrganizationStore = create(persist(immer<OrganizationStore>(store), { name: StoreName.organization }));
