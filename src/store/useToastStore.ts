import { createWithEqualityFn as create } from "zustand/traditional";

import { ToastStore } from "@interfaces/store";

export const useToastStore = create<ToastStore>((set) => ({
	addToast: (toast) => {
		const id = Date.now().toString();

		return set((state) => ({
			toasts: [...state.toasts, { ...toast, id }],
		}));
	},
	removeToast: (id) =>
		set((state) => ({
			toasts: state.toasts.filter((toast) => toast.id !== id),
		})),
	toasts: [],
}));
