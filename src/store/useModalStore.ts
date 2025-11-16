import { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { ModalStore } from "@interfaces/store";
import { ModalName } from "@src/enums";

const store: StateCreator<ModalStore> = (set, get) => ({
	closeModal: (name: string) =>
		set((state) => {
			const newModalData = { ...state.modalData };
			delete newModalData[name];
			return {
				data: undefined,
				modalData: newModalData,
				modals: { ...state.modals, [name]: false },
			};
		}),
	data: undefined,
	modalData: {},
	modals: {
		[ModalName.editConnection]: true,
	},
	isModalOpen: (name: string) => !!get().modals[name],
	openModal: (name, data) =>
		set((state) => ({
			data,
			modalData: { ...state.modalData, [name]: data },
			modals: { ...state.modals, [name]: true },
		})),
	getModalData: <T = unknown>(name: string): T | undefined => {
		return get().modalData[name] as T | undefined;
	},
	closeAllModals: () =>
		set(() => ({
			data: undefined,
			modalData: {},
			modals: {},
		})),
});

export const useModalStore = create(store, shallow);
