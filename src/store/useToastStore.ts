import { create } from "zustand";

import { ToastStore } from "@interfaces/store";

export const useToastStore = create<ToastStore>((set) => ({
	addToast: (toast) =>
		set((state) => ({
			toasts: [...state.toasts, toast],
		})),
	removeToast: (id) =>
		set((state) => ({
			toasts: state.toasts.filter((toast) => toast.id !== id),
		})),
	toasts: [],
}));
