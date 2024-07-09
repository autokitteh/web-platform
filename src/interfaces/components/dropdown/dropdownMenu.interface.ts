export interface DropdownMenuProps {
	children: React.ReactNode;
	className?: string;
	container?: DocumentFragment | Element;
	isOpen: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	style?: React.CSSProperties;
}
