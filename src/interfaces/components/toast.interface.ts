export interface Toast {
	id: string;
	message: string;
	type: ToasterTypes;
	showCopyButton?: boolean;
}

export type ToasterTypes = "error" | "info" | "success";

export interface ToastStore {
	addToast: (toast: Toast) => void;
	removeToast: (id: string) => void;
	toasts: Toast[];
}
