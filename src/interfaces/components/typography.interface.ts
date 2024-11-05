import { ElementType, ReactNode } from "react";

export interface TypographyProps<E extends ElementType = ElementType> {
	[x: string]: any;
	children: ReactNode;
	className?: string;
	element?: E;
	size?: "1.5xl" | "xl" | "large" | "medium" | "small" | "default";
}
