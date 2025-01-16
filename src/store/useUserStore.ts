import i18n from "i18next";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName, UserStatusType } from "@enums";
import { UserStore } from "@interfaces/store";
import { AuthService, UsersService } from "@services";
import { ServiceResponse } from "@src/types";
import { User } from "@src/types/models";

import { useToastStore, useOrganizationStore } from "@store";

const defaultState = {
	user: undefined,
	role: undefined,
};

const store: StateCreator<UserStore> = (set) => ({
	...defaultState,
	getUser: async ({ email, userId }): Promise<ServiceResponse<User>> => {
		const { data: user, error } = await UsersService.get({ email, userId });
		if (error) {
			useToastStore.getState().addToast({
				message: i18n.t("user.failedFetchingUser", { ns: "stores" }),
				type: "error",
			});
			return { data: undefined, error };
		}
		return { data: user, error: undefined };
	},
	createUser: async (email: string, status: UserStatusType): Promise<ServiceResponse<string>> => {
		const { data: userId, error } = await UsersService.create(email, status);
		if (error) {
			useToastStore.getState().addToast({
				message: i18n.t("user.failedCreatingUser", { ns: "stores" }),
				type: "error",
			});
			return { data: undefined, error };
		}
		return { data: userId, error: undefined };
	},
	getLoggedInUser: async (): ServiceResponse<User> => {
		const { data: user, error } = await AuthService.whoAmI();

		if (!user || error) {
			const errorMessage = i18n.t("user.failedGettingLoggedInUser", {
				ns: "stores",
			});

			useToastStore.getState().addToast({
				message: errorMessage,
				type: "error",
			});

			return { error: errorMessage, data: undefined };
		}

		const { data: userMember, error: memberFetchError } = await useOrganizationStore.getState().getMember(user.id);

		if (memberFetchError || !userMember) {
			const errorMessage = i18n.t("user.failedGettingLoggedInUserRole", {
				ns: "stores",
			});

			useToastStore.getState().addToast({
				message: errorMessage,
				type: "error",
			});

			return { error: errorMessage, data: undefined };
		}

		set((state) => ({
			...state,
			user,
			role: userMember.role,
		}));

		return { data: user, error: undefined };
	},
	logoutFunction: () => {},
	setLogoutFunction: (logoutFn) => {
		set((state) => ({
			...state,
			logoutFunction: logoutFn,
		}));
	},
	reset: () => set(defaultState),
});

export const useUserStore = create(persist(immer(store), { name: StoreName.user }));
