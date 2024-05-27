import { StoreName } from "@enums";
import { UserStore } from "@interfaces/store/userStore.interface";
import { AuthService } from "@services/auth.service";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const defaultState: Omit<UserStore, "whoAmI"> = {
	user: undefined,
};
const store: StateCreator<UserStore, [["zustand/persist", unknown], ["zustand/immer", never]], []> = (set) => ({
	...defaultState,

	whoAmI: async () => {
		const { data, error } = await AuthService.whoAmI();

		if (error) {
			// LoggerService.error(namespaces.userStore, (error as Error).message);
			return { error, user: undefined };
		}

		set((state) => {
			state.user = data;
		});
		return { error: undefined, user: data };
	},
});

export const useUserStore = create(persist(immer(store), { name: StoreName.user }));
