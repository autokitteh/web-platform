import { ModalStore } from "@interfaces/store";
import { StateCreator, create } from "zustand";

const store: StateCreator<ModalStore> = (set) => ({
	modals: {},
	data: undefined,
	openModal: (name, data) =>
		set((state) => ({
			modals: { ...state.modals, [name]: true },
			data,
		})),
	closeModal: (name: string) =>
		set((state) => ({
			modals: { ...state.modals, [name]: false },
			data: undefined,
		})),
});

export const useModalStore = create(store);
