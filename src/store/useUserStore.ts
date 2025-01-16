import i18n from "i18next";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName, UserStatusType } from "@enums";
import { UserStore } from "@interfaces/store";
import { AuthService, UsersService, LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { ServiceResponse } from "@src/types";
import { User } from "@src/types/models";

import { useToastStore } from "@store";

const defaultState = {
	user: undefined,
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

		if (error) {
			return { error, data: undefined };
		}

		if (!user) {
			const errorMessage = i18n.t("user.failedGettingLoggedInUser", {
				ns: "stores",
			});
			LoggerService.error(namespaces.stores.userStore, errorMessage);

			return { error: errorMessage, data: undefined };
		}

		set((state) => ({
			...state,
			user,
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
