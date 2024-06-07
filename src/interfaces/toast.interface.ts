export interface Toast {
	id: string;
	message: string;
	type: "success" | "error" | "info";
	title: string;
}

export interface ToastStore {
	toasts: Toast[];
	addToast: (toast: Toast) => void;
	removeToast: (id: string) => void;
}
