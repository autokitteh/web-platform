export interface Toast {
	id: string;
	message: string;
	type: ToasterTypes;
	showCopyButton?: boolean;
}

export type ToasterTypes = "error" | "info" | "success";

export interface ToastStore {
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;
	toasts: Toast[];
}
