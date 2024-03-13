import { IModalStore } from "@interfaces/store";
import { StateCreator, create } from "zustand";

const store: StateCreator<IModalStore> = (set) => ({
	modals: {},
	openModal: (name: string) =>
		set((state) => ({
			modals: { ...state.modals, [name]: true },
		})),
	closeModal: (name: string) =>
		set((state) => ({
			modals: { ...state.modals, [name]: false },
		})),
});

export const useModalStore = create(store);
