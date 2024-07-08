export interface DropdownMenuProps {
	children: React.ReactNode;
	className?: string;
	container?: Element | DocumentFragment;
	isOpen: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	style?: React.CSSProperties;
}
