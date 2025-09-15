export interface LinkProps {
	ariaLabel?: string;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	target?: React.HTMLAttributeAnchorTarget;
	to: string;
	title?: string;
	id?: string;
	onClick?: React.MouseEventHandler<HTMLAnchorElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLAnchorElement>;
	onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
	onMouseLeave?: React.MouseEventHandler<HTMLAnchorElement>;
	role?: string;
	tabIndex?: number;
}
