export interface ToastProps {
	className?: string;
	children: React.ReactNode;
	isOpen: boolean;
	duration?: number;
	onClose: () => void;
}
