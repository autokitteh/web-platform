import { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { ModalStore } from "@interfaces/store";

const store: StateCreator<ModalStore> = (set, get) => ({
	closeModal: (name: string) =>
		set((state) => ({
			data: undefined,
			modals: { ...state.modals, [name]: false },
		})),
	data: undefined,
	modals: {},
	isModalOpen: (name: string) => !!get().modals[name],
	openModal: (name, data) =>
		set((state) => ({
			data,
			modals: { ...state.modals, [name]: true },
		})),
	closeAllModals: () =>
		set(() => ({
			data: undefined,
			modals: {},
		})),
});

export const useModalStore = create(store, shallow);
