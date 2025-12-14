import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { ToastStore } from "@interfaces/store";

export const useToastStore = create<ToastStore>(
	(set) => ({
		addToast: (toast) => {
			const id = crypto.randomUUID();

			return set((state) => ({
				toasts: [...state.toasts, { ...toast, id }],
			}));
		},
		removeToast: (id) =>
			set((state) => ({
				toasts: state.toasts.filter((toast) => toast.id !== id),
			})),
		toasts: [],
	}),
	shallow
);
