import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { useOrganizationStore } from "./useOrganizationStore";
import { ToastStore } from "@interfaces/store";
import { descopeProjectId } from "@src/constants";
import { AuthState } from "@src/enums";

export const useToastStore = create<ToastStore>(
	(set) => ({
		addToast: (toast) => {
			const { authState } = useOrganizationStore.getState();

			if (descopeProjectId && (authState === AuthState.CHECKING || authState === AuthState.UNAUTHORIZED)) {
				return;
			}

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
	}),
	shallow
);
