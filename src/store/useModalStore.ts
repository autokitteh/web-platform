import { StateCreator } from "zustand";
import { createWithEqualityFn as create } from "zustand/traditional";

import { ModalStore } from "@interfaces/store";

const store: StateCreator<ModalStore> = (set) => ({
	closeModal: (name: string) =>
		set((state) => ({
			data: undefined,
			modals: { ...state.modals, [name]: false },
		})),
	data: undefined,
	modals: {},
	openModal: (name, data) =>
		set((state) => ({
			data,
			modals: { ...state.modals, [name]: true },
		})),
});

export const useModalStore = create(store);
