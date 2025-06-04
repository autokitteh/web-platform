import { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { ModalName } from "@enums/components";
import { ModalStore } from "@interfaces/store";
import { ModalData } from "@src/types/modals.types";

const store: StateCreator<ModalStore> = (set, get) => ({
	closeModal: (name: string) =>
		set((state) => ({
			data: undefined,
			modals: { ...state.modals, [name]: false },
		})),
	data: undefined,
	modals: {},

	// Type-safe modal opening
	openModal: <T extends ModalName>(name: T, ...args: any[]) => {
		const data = args.length > 0 ? args[0] : undefined;
		set((state) => ({
			data,
			modals: { ...state.modals, [name]: true },
		}));
	},

	// Legacy method for backward compatibility
	openModalLegacy: (name: string, data?: any) =>
		set((state) => ({
			data,
			modals: { ...state.modals, [name]: true },
		})),

	closeAllModals: () =>
		set(() => ({
			data: undefined,
			modals: {},
		})),

	// Type-safe data getter
	getModalData: <T extends ModalName>(name: T) => {
		const state = get();
		return state.modals[name] ? (state.data as ModalData<T>) : undefined;
	},
});

export const useModalStore = create(store, shallow);
