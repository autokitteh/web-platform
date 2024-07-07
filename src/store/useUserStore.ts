import { StoreName } from "@enums";
import { UserStore } from "@interfaces/store";
import { AuthService } from "@services";
import create, { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const defaultState = {
	user: undefined,
};

const store: StateCreator<UserStore> = (set) => ({
	...defaultState,
	getLoggedInUser: async () => {
		const { data, error } = await AuthService.whoAmI();

		if (error) {
			return { data: undefined, error };
		}

		set((state) => ({
			...state,
			user: data,
		}));

		return { data, error: undefined };
	},
	logoutFunction: () => {},
	reset: () => set(defaultState),
	setLogoutFunction: (logoutFn) => {
		set((state) => ({
			...state,
			logoutFunction: logoutFn,
		}));
	},
});

export const useUserStore = create(persist(immer(store), { name: StoreName.user }));
