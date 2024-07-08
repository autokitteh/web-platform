export interface Toast {
	id: string;
	message: string;
	type: ToasterTypes;
}

export type ToasterTypes = "success" | "error" | "info";

export interface ToastStore {
	addToast: (toast: Toast) => void;
	removeToast: (id: string) => void;
	toasts: Toast[];
}
