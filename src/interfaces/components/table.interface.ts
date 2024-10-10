import { KeyboardEvent, MouseEvent } from "react";

import { ColorSchemes } from "@src/types";

export interface TableProps {
	children?: React.ReactNode;
	className?: string;
	onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
	style?: React.CSSProperties;
	hasFixedWidth?: boolean;
	title?: string;
}

export interface TableVariantContextType {
	variant: ColorSchemes;
}
