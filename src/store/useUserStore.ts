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
	logoutFunction: () => {},
	setLogoutFunction: (logoutFn) => {
		set((state) => ({
			...state,
			logoutFunction: logoutFn,
		}));
	},
	getLoggedInUser: async () => {
		const { data, error } = await AuthService.whoAmI();

		if (error) {
			return { error, data: undefined };
		}

		set((state) => ({
			...state,
			user: data,
		}));

		return { error: undefined, data };
	},
	reset: () => {
		set(() => ({
			...defaultState,
			logoutFunction: () => {},
			setLogoutFunction: (logoutFn) => {
				set((state) => ({
					...state,
					logoutFunction: logoutFn,
				}));
			},
			getLoggedInUser: async () => {
				const { data, error } = await AuthService.whoAmI();
				if (error) {
					return { error, data: undefined };
				}
				set((state) => ({
					...state,
					user: data,
				}));
				return { error: undefined, data };
			},
		}));
	},
});

export const useUserStore = create(persist(immer(store), { name: StoreName.user }));
