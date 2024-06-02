import { StoreName } from "@enums";
import { UserStore } from "@interfaces/store";
import { AuthService } from "@services";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

const defaultState: Omit<UserStore, "getLoggedInUser"> = {
	user: undefined,
};

const store: StateCreator<UserStore> = (set) => ({
	...defaultState,

	getLoggedInUser: async () => {
		const { data, error } = await AuthService.whoAmI();

		if (error) {
			return { error, user: undefined };
		}

		set((state) => ({ ...state, user: data }));

		return { error: undefined, user: data };
	},
});

export const useUserStore = create(persist(store, { name: StoreName.user }));
