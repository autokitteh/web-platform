import { StoreName } from "@enums";
import { UserStore } from "@interfaces/store";
import { AuthService } from "@services";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const defaultState: Omit<UserStore, "getLoggedInUser"> = {
	user: undefined,
	reset: () => {},
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

	reset: () => {
		set(defaultState);
	},
});

export const useUserStore = create(persist(immer(store), { name: StoreName.project }));
