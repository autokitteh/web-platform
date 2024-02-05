export interface IDropdownMenu {
	isOpen: boolean;
	className?: string;
	children: React.ReactNode;
	style?: React.CSSProperties;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}
