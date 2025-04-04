export interface Toast {
	id: string;
	message: React.ReactNode;
	type: ToasterTypes;
	hideSystemLogLinkOnError?: boolean;
	position?: "top-right" | "default";
	offset?: number;
	className?: string;
	hiddenCloseButton?: boolean;
	customTitle?: React.ReactNode | string;
}

export type ToasterTypes = "error" | "info" | "success";

export interface ToastStore {
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;
	toasts: Toast[];
}
