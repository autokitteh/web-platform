import dayjs from "dayjs";
import { t } from "i18next";
import { produce } from "immer";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { MemberRole, MemberStatusType, StoreName, UserStatusType } from "@enums";
import { AuthService, LoggerService, OrganizationsService, UsersService } from "@services";
import { namespaces, cookieRefreshInterval } from "@src/constants";
import { EnrichedMember, EnrichedOrganization, Organization, User } from "@src/types/models";
import { OrganizationStore, OrganizationStoreState } from "@src/types/stores";
import { requiresRefresh, retryAsyncOperation } from "@src/utilities";

const defaultState: OrganizationStoreState = {
	organizations: {},
	enrichedOrganizations: [],
	members: {},
	users: {},
	lastCookieRefreshDate: "",
	user: undefined,
	currentOrganization: undefined,
	amIadminCurrentOrganization: false,
	isLoading: {
		organizations: false,
		members: false,
		inviteMember: false,
		deleteMember: false,
		updateMember: false,
		deletingOrganization: false,
		updatingOrganization: false,
		updatingUser: false,
	},
	logoutFunction: () => {},
};
const store: StateCreator<OrganizationStore> = (set, get) => ({
	...defaultState,
	refreshCookie: async () => {
		const { lastCookieRefreshDate, user } = get();
		if (!user) return;

		const lastRefreshDate = lastCookieRefreshDate ? dayjs(lastCookieRefreshDate) : null;

		if (!requiresRefresh(lastRefreshDate, cookieRefreshInterval)) {
			return;
		}

		try {
			await retryAsyncOperation<User>(async () => AuthService.whoAmI(), 3, 3000);

			set((state) => ({ ...state, lastCookieRefreshDate: dayjs().toISOString() }));
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.cookieNotRefreshed", {
					ns: "stores",
					use: user.id,
				})
			);
			const { logoutFunction } = get();

			logoutFunction(true);
			return { data: undefined, error: true };
		}

		set((state) => ({ ...state, lastCookieRefreshDate: dayjs().toISOString() }));
	},
	updateMemberStatus: async (organizationId: string, status: MemberStatusType) => {
		const { user } = get();
		if (!user) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.currentUserNotFoundCantUpdateMember", {
					ns: "stores",
					organizationId,
				})
			);
			return { data: undefined, error: true };
		}
		set((state) => ({
			...state,
			isLoading: {
				...state.isLoading,
				updateMember: true,
			},
		}));
		const response = await OrganizationsService.updateMemberStatus(organizationId, user.id, status);

		if (response.error) {
			set((state) => ({ ...state, isLoading: { ...state.isLoading, updateMember: false } }));
			return response;
		}
		const newMembers = produce(get().members, (draft) => {
			if (!draft[organizationId]) {
				draft[organizationId] = {};
			}
			draft[organizationId][user.id] = { ...draft[organizationId][user.id], status };
		});

		set((state) => {
			return {
				...state,
				members: newMembers,
				isLoading: { ...state.isLoading, updateMember: false },
			};
		});

		return response;
	},

	getCurrentOrganizationEnriched: () => {
		const { currentOrganization, user } = get();
		if (!user) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.noUserFound", {
					ns: "stores",
					organizationId: currentOrganization?.id,
				})
			);
			return { error: true, data: undefined };
		}
		if (!currentOrganization) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.noCurrentOrganization", {
					ns: "stores",
					userId: user.id,
				})
			);
			return { error: true, data: undefined };
		}

		const organization = get().organizations[currentOrganization?.id];
		if (!organization) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.organizationNotFound", {
					ns: "stores",
					organizationId: currentOrganization?.id,
				})
			);
			return { error: true, data: undefined };
		}

		const member = get().members[organization?.id]?.[user?.id];

		if (!member) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.noMemberFound", {
					ns: "stores",
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
			} as EnrichedOrganization,
			error: false,
		};
	},

	deleteOrganization: async (organization: Organization) => {
		set((state) => ({ ...state, isLoading: { ...state.isLoading, deletingOrganization: true } }));

		const { user } = get();

		if (user?.defaultOrganizationId === organization.id) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.userShouldntDeleteDefaultOrganization", {
					ns: "stores",
					organizationId: organization.id,
					userId: user?.id,
				})
			);
			set((state) => ({ ...state, isLoading: { ...state.isLoading, deletingOrganization: false } }));

			return { error: true, data: undefined };
		}
		const { error } = await OrganizationsService.delete(organization);

		if (error) {
			set((state) => ({ ...state, isLoading: { ...state.isLoading, deletingOrganization: false } }));

			return { error: true, data: undefined };
		}

		set((state) => {
			const newOrganizations = { ...state.organizations };
			const newMembers = { ...state.members };
			const defaultOrganization = state.organizations[user?.defaultOrganizationId || ""];
			delete newOrganizations[organization.id];
			delete newMembers[organization.id];
			return {
				...state,
				members: newMembers,
				organizations: newOrganizations,
				currentOrganization: defaultOrganization,
			};
		});

		set((state) => ({ ...state, isLoading: { ...state.isLoading, deletingOrganization: false } }));

		return { data: undefined, error: undefined };
	},

	getEnrichedOrganizations: async (skipReload) => {
		if (!skipReload) {
			await get().getOrganizations();
		}

		const { organizations, members, user, currentOrganization } = get();
		if (
			!user?.id ||
			!currentOrganization ||
			!Object.keys(organizations || {}).length ||
			!Object.keys(members || {}).length
		) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.currentOrganizationInformationMissing", {
					ns: "stores",
					organizationId: currentOrganization?.id,
					userId: user?.id,
					organizations: JSON.stringify(organizations),
					members: JSON.stringify(members),
				})
			);
			return { data: undefined, error: true };
		}

		const enrichedOrganizations = Object.values(organizations)
			.map((organization) => {
				const currentMember = members[organization.id]?.[user?.id];
				if (!currentMember) {
					LoggerService.error(
						namespaces.stores.organizationStore,
						t("organization.noMemberFound", {
							ns: "stores",
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
			})
			.filter((organization) => organization !== undefined) as EnrichedOrganization[];

		const currentOrganizationEnriched = get().getCurrentOrganizationEnriched();
		set((state) => ({
			...state,
			enrichedOrganizations,
			amIadminCurrentOrganization:
				(currentOrganizationEnriched?.data?.currentMember?.role || "") === MemberRole.admin,
		}));

		return {
			data: enrichedOrganizations,
			error: undefined,
		};
	},

	updateOrganization: async (organization: Organization, fieldMask: string[]) => {
		set((state) => ({ ...state, isLoading: { ...state.isLoading, updatingOrganization: true } }));

		const { error } = await OrganizationsService.update(organization, fieldMask);
		set((state) => ({ ...state, isLoading: { ...state.isLoading, updatingOrganization: false } }));

		if (error) {
			return { error: true, data: undefined };
		}

		set((state) => {
			const newOrganizations = produce(state.organizations, (draft) => {
				draft[organization.id] = organization;
			});
			return {
				...state,
				organizations: newOrganizations,
				currentOrganization: organization,
			};
		});

		return { error: undefined, data: undefined };
	},

	getEnrichedMembers: () => {
		const { currentOrganization } = get();
		if (!currentOrganization) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.noOrganizationFoundCantGetMembers", {
					ns: "stores",
				})
			);
			return { data: undefined, error: true };
		}
		const members = get().members[currentOrganization.id];
		if (!members || !Object.keys(members).length) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.noMembersFound", {
					ns: "stores",
					organizationId: currentOrganization.id,
				})
			);
			return { data: undefined, error: true };
		}
		return {
			data: Object.entries(members).map(
				([userId, member]) =>
					({
						...get().users[userId],
						...member,
					}) as EnrichedMember
			),
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
				t("organization.noOrganizationFoundCantDeleteMember", {
					ns: "stores",
					userId,
				})
			);
			return { data: undefined, error: true };
		}
		set((state) => ({ ...state, isLoading: { ...state.isLoading, deleteMember: true } }));

		const response = await OrganizationsService.deleteMember(organization.id, userId);

		set((state) => {
			const newMembers = produce(state.members, (draft) => {
				delete draft[organization.id][userId];
			});
			const newUsers = produce(state.users, (draft) => {
				delete draft[userId];
			});
			return {
				...state,
				members: newMembers,
				users: newUsers,
				isLoading: { ...state.isLoading, deleteMember: false },
			};
		});

		return response;
	},

	inviteMember: async (email: string) => {
		set((state) => ({ ...state, isLoading: { ...state.isLoading, inviteMember: true } }));
		const { data: user } = await UsersService.get({ email });
		const organization = get().currentOrganization;
		if (!organization) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.noOrganizationFoundCantInviteMember", {
					ns: "stores",
					email,
				})
			);
			set((state) => ({ ...state, isLoading: { ...state.isLoading, inviteMember: false } }));
			return { data: undefined, error: true };
		}
		let userId = user?.id;
		if (!user) {
			const { data: userIdCreatedUser, error: userCreateError } = await UsersService.create(
				email,
				UserStatusType.invited
			);
			if (userCreateError || !userIdCreatedUser) {
				LoggerService.error(
					namespaces.stores.organizationStore,
					t("organization.userNotCreatedCantInviteMember", {
						ns: "stores",
						email,
					})
				);
				set((state) => ({ ...state, isLoading: { ...state.isLoading, inviteMember: false } }));

				return { data: undefined, error: userCreateError };
			}
			userId = userIdCreatedUser;
		}
		if (!userId) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.noUserIdCantInviteMember", {
					ns: "stores",
					email,
				})
			);
			set((state) => ({ ...state, isLoading: { ...state.isLoading, inviteMember: false } }));

			return { data: undefined, error: true };
		}

		const response = await OrganizationsService.inviteMember(organization.id, userId);
		set((state) => ({ ...state, isLoading: { ...state.isLoading, inviteMember: false } }));
		const { getMembers } = get();
		await getMembers();
		return response;
	},

	getOrganizations: async (loginUser) => {
		set((state) => ({ ...state, isLoading: { ...state.isLoading, organizations: true } }));
		const { user, currentOrganization } = get();
		const currentUser = user || loginUser;

		if (!currentUser) {
			LoggerService.error(namespaces.stores.organizationStore, "getOrganizations");

			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.noUserFound", { ns: "stores", organizationId: currentOrganization?.id })
			);
			set((state) => ({
				...state,
				organizations: undefined,
				isLoading: { ...state.isLoading, organizations: false },
			}));
			return { error: true, data: undefined };
		}
		const response = await OrganizationsService.list(currentUser.id);

		if (
			response.error ||
			!Object.keys(response.data?.organizations || {}).length ||
			!Object.keys(response.data?.members || {}).length
		) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.organizationsAndMembersNotFound", {
					ns: "stores",
					organizations: JSON.stringify(response.data?.organizations || {}),
					members: JSON.stringify(response.data?.members || {}),
					userId: currentUser.id,
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
		const { currentOrganization: organization, user } = get();
		if (!organization) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.noOrganizationFoundCantFetchMembers", {
					ns: "stores",
				})
			);
			return { data: undefined, error: true };
		}
		if (!user) {
			LoggerService.error(
				namespaces.stores.organizationStore,
				t("organization.noUserFoundCantFetchMembers", {
					ns: "stores",
				})
			);
			return { data: undefined, error: true };
		}
		const membersResponse = await OrganizationsService.listMembers(organization.id);
		const organizationsResponse = await OrganizationsService.list(user.id);

		if (membersResponse.data && organizationsResponse.data) {
			const { users, members: membersCurrentOrganization } = membersResponse.data;
			const { members } = organizationsResponse.data;
			set((state) => ({
				...state,
				users,
				members: {
					...members,
					...membersCurrentOrganization,
				},
			}));
		}

		set((state) => ({ ...state, isLoading: { ...state.isLoading, members: false } }));
		return { error: false, data: undefined };
	},

	updateUserName: async (user: User) => {
		set((state) => ({ ...state, isLoading: { ...state.isLoading, updatingUser: true } }));

		const { error } = await UsersService.update(user, ["display_name"]);
		set((state) => ({ ...state, isLoading: { ...state.isLoading, updatingUser: false } }));
		if (error) {
			return {
				data: undefined,
				error: t("organization.failedUpdatingUserName", {
					ns: "stores",
					userDetails: JSON.stringify(user),
				}),
			};
		}
		set((state) => ({ ...state, user }));
		return { data: undefined, error: undefined };
	},

	setCurrentOrganization: (organization) => {
		set((state) => ({ ...state, currentOrganization: organization }));
	},

	reset: () => set(defaultState),

	createUser: async (email: string, status: UserStatusType) => {
		const { data: userId, error } = await UsersService.create(email, status);
		if (error) {
			return { data: undefined, error: t("organization.failedCreatingUser", { ns: "stores" }) };
		}
		return { data: userId, error: undefined };
	},

	login: async () => {
		const { data: user, error } = await AuthService.whoAmI();

		if (error) {
			return { error, data: undefined };
		}

		if (!user) {
			const errorMessage = t("organization.failedGettingLoggedInUser", {
				ns: "stores",
			});
			LoggerService.error(namespaces.stores.userStore, errorMessage);

			return { error: errorMessage, data: undefined };
		}

		set(() => ({ user }));

		const { error: errorOrganization } = await get().getOrganizations(user);

		const userOrganization = Object.values(get().organizations)?.find(
			(organization) => organization.id === user.defaultOrganizationId
		);

		if (errorOrganization || !userOrganization) {
			const errorMessage = t("organization.failedGettingLoggedInUserOrganization", {
				ns: "stores",
				userId: user.id,
			});
			LoggerService.error(namespaces.stores.userStore, errorMessage);
			return { data: undefined, error: true };
		}
		get().setCurrentOrganization(userOrganization);

		const { error: errorEnrichedOrganization } = await get().getEnrichedOrganizations(true);

		if (errorEnrichedOrganization) {
			const errorMessage = t("organization.failedGettingLoggedInUserOrganization", {
				ns: "stores",
				userId: user.id,
			});
			LoggerService.error(namespaces.stores.userStore, errorMessage);
			return { data: undefined, error: true };
		}

		return { data: user, error: undefined };
	},
	setLogoutFunction: (logoutFn) => {
		set((state) => ({
			...state,
			logoutFunction: logoutFn,
		}));
	},
});
export const useOrganizationStore = create(persist(immer<OrganizationStore>(store), { name: StoreName.organization }));
