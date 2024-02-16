export interface IToast {
	className?: string;
	children: React.ReactNode;
	isOpen: boolean;
	duration?: number;
	onClose: () => void;
}
