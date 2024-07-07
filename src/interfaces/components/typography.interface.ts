import { ElementType, ReactNode } from "react";

export interface TypographyProps<E extends ElementType = ElementType> {
	[x: string]: any;
	element?: E;
	children: ReactNode;
	className?: string;
	size?: "small" | "medium" | "large";
}
