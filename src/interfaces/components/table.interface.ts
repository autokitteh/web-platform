export interface TableProps {
	children?: React.ReactNode;
	className?: string;
	onClick?: () => void;
	style?: React.CSSProperties;
}

export interface TableVariantContextType {
	variant: "light" | "dark";
}
