import { ToasterTypes } from "@src/types/components/toasterTypes.type";

export interface Toast {
	id: string;
	message: React.ReactNode;
	type: ToasterTypes;
	hideSystemLogLinkOnError?: boolean;
}

export type { ToasterTypes };

export interface ToastStore {
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;
	toasts: Toast[];
}
