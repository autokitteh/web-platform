export interface DropdownMenuProps {
	isOpen: boolean;
	className?: string;
	children: React.ReactNode;
	style?: React.CSSProperties;
	container?: Element | DocumentFragment;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}
