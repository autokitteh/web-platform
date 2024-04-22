export interface ToastProps {
	className?: string;
	title?: string;
	type: "success" | "error" | "warning";
	children: React.ReactNode;
	isOpen: boolean;
	duration?: number;
	onClose: () => void;
}
