export interface TableProps {
	children?: React.ReactNode;
	className?: string;
	onClick?: () => void;
	style?: React.CSSProperties;
	variant?: "light" | "dark";
}
