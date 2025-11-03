import { KeyboardEvent, MouseEvent } from "react";

import { ColorSchemes } from "@src/types";

export interface TableProps {
	children?: React.ReactNode;
	className?: string;
	onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
	style?: React.CSSProperties;
	title?: string;
	innerDivClassName?: string;
	textWrapperClassName?: string;
	ariaLabel?: string;
}

export interface TableContainerProps {
	children: React.ReactNode;
	className?: string;
	variant?: ColorSchemes;
}

export interface TableRowGroupProps {
	children: React.ReactNode;
	className?: string;
}

export interface TableRowProps {
	children: React.ReactNode;
	className?: string;
	onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
	style?: React.CSSProperties;
}

export interface TableVariantContextType {
	variant: ColorSchemes;
}
