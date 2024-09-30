import i18n from "i18next";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { UserStore } from "@interfaces/store";
import { AuthService } from "@services";

const defaultState = {
	user: undefined,
};

const store: StateCreator<UserStore> = (set) => ({
	...defaultState,
	getLoggedInUser: async (): Promise<string> => {
		const { data: user, error } = await AuthService.whoAmI();

		if (error) {
			return error as string;
		}

		if (!user) {
			const errorMsg = i18n.t("userNotFound", { ns: "services" });

			return errorMsg;
		}

		set((state) => ({
			...state,
			user,
		}));

		return "";
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
