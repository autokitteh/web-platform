export interface Toast {
	id: string;
	message: string;
	type: ToasterTypes;
}

export type ToasterTypes = "success" | "error" | "info";

export interface ToastStore {
	toasts: Toast[];
	addToast: (toast: Toast) => void;
	removeToast: (id: string) => void;
}
