import { ToastType } from "@type/components";

export interface ToastProps {
	className?: string;
	title?: string;
	type: ToastType;
	children: React.ReactNode;
	isOpen: boolean;
	duration?: number;
	onClose: () => void;
}
