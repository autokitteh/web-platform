import { menuItems } from "@constants";
import { IUIGlobalStore } from "@interfaces/store";
import { ProjectsService } from "@services";
import { shouldUpdateCache } from "@utilities";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

const store: StateCreator<IUIGlobalStore> = (set, get) => ({
	menuItems,
	lastMenuUpdate: undefined,
	isFullScreen: false,
	toggleFullScreen: () =>
		set((state) => ({
			...state,
			isFullScreen: !state.isFullScreen,
		})),
	refreshMenu: async (forceUpdate = false) => {
		if (!forceUpdate && !shouldUpdateCache(6, get().lastMenuUpdate)) return;

		const { data, error } = await ProjectsService.list();
		if (error) return;

		const updatedSubmenu = data?.map(({ projectId, name }) => ({
			id: projectId,
			name,
		}));

		set(({ menuItems }) => ({
			menuItems: menuItems.map((item) => (item.id === 1 ? { ...item, submenu: updatedSubmenu } : item)),
			lastUpdate: Date.now(),
		}));
	},
});

export const useUiGlobalStore = create(persist(store, { name: "UIGlobalStore" }));
