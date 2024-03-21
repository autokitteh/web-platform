import { IModalStore } from "@interfaces/store";
import { StateCreator, create } from "zustand";

const store: StateCreator<IModalStore> = (set) => ({
	modals: {},
	itemId: undefined,
	openModal: (name: string, itemId?: string) =>
		set((state) => ({
			modals: { ...state.modals, [name]: true },
			itemId,
		})),
	closeModal: (name: string) =>
		set((state) => ({
			modals: { ...state.modals, [name]: false },
			itemId: undefined,
		})),
});

export const useModalStore = create(store);
