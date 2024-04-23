import { ToastVariant } from "@enums/components";

export interface ToastProps {
	className?: string;
	title?: string;
	type: keyof typeof ToastVariant;
	children: React.ReactNode;
	isOpen: boolean;
	duration?: number;
	onClose: () => void;
}
