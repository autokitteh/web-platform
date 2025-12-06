import { ToasterTypes } from "@src/types/components";

export interface Toast {
	id: string;
	message: React.ReactNode;
	type: ToasterTypes;
	hideSystemLogLinkOnError?: boolean;
	duration?: number;
}

export interface ToastStore {
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;
	toasts: Toast[];
}
