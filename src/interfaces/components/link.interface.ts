export interface LinkProps {
	ariaLabel?: string;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
	target?: React.HTMLAttributeAnchorTarget;
	to: string;
	title?: string;
	id?: string;
}
