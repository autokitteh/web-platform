import { ElementType, ReactNode } from "react";

export interface TypographyProps<E extends ElementType = ElementType> {
	element?: E;
	children: ReactNode;
	className?: string;
	size?: "small" | "medium" | "large";
	[x: string]: any;
}
