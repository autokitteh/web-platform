export interface DropdownMenuProps {
	children: React.ReactNode;
	className?: string;
	isOpen: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	style?: React.CSSProperties;
}
