import { ColorSchemes } from "@src/types";

export interface TableProps {
	children?: React.ReactNode;
	className?: string;
	onClick?: () => void;
	style?: React.CSSProperties;
	customWidth?: boolean;
}

export interface TableVariantContextType {
	variant: ColorSchemes;
}
