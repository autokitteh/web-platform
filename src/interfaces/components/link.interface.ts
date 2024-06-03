export interface LinkProps {
	to: string;
	className?: string;
	ariaLabel?: string;
	disabled?: boolean;
	target?: React.HTMLAttributeAnchorTarget;
	children: React.ReactNode;
}
