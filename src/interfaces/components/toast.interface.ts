import { ToastPosition, ToastType } from "@src/types/components";

export interface Toast {
	id: string;
	message: React.ReactNode;
	type: ToastType;
	hideSystemLogLinkOnError?: boolean;
	position?: ToastPosition;
	offset?: number;
	className?: string;
	hiddenCloseButton?: boolean;
	customTitle?: React.ReactNode | string;
	closeOnClick?: boolean;
}

export interface ToastStore {
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;
	toasts: Toast[];
}
