import { StoreName } from "@enums";
import { UserStore } from "@interfaces/store";
import { AuthService } from "@services";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

const defaultState: Omit<UserStore, "whoAmI"> = {
	user: undefined,
};

const store: StateCreator<UserStore> = (set) => ({
	...defaultState,

	whoAmI: async () => {
		const { data, error } = await AuthService.whoAmI();

		if (error) {
			// LoggerService.error(namespaces.userStore, (error as Error).message);
			return { error, user: undefined };
		}

		set((state) => {
			state.user = data;
			return state;
		});
		return { error: undefined, user: data };
	},
});

export const useUserStore = create(persist(store, { name: StoreName.user }));
