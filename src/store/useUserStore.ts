import i18n from "i18next";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { UserStore } from "@interfaces/store";
import { AuthService } from "@services";
import { ServiceResponse } from "@src/types";
import { User } from "@src/types/models";

const defaultState = {
	user: undefined,
};

const store: StateCreator<UserStore> = (set) => ({
	...defaultState,
	getLoggedInUser: async (): ServiceResponse<User> => {
		const { data: user, error } = await AuthService.whoAmI();

		if (error) {
			return { error, data: undefined };
		}

		if (!user) {
			const errorMsg = i18n.t("userNotFound", { ns: "services" });

			return { error: errorMsg, data: undefined };
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
});

export const useUserStore = create(persist(immer(store), { name: StoreName.user }));
