import { ToastType } from "@type/components";

export interface ToastProps {
	className?: string;
	title?: string;
	ariaLabel?: string;
	type?: ToastType;
	children?: React.ReactNode;
}
