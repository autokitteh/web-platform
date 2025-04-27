import { KeyboardEvent, MouseEvent } from "react";

import { ColorSchemes } from "@types";

export interface TableProps {
	children?: React.ReactNode;
	className?: string;
	onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
	style?: React.CSSProperties;
	title?: string;
	innerDivClassName?: string;
	textWrapperClassName?: string;
}

export interface TableVariantContextType {
	variant: ColorSchemes;
}
