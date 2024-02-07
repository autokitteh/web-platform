export interface IModal {
	className?: string;
	children: React.ReactNode;
	isOpen: boolean;
	onClose: () => void;
}
