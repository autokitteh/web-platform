import React, { ElementType } from "react";

import { TypographyProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Typography = <E extends ElementType = "div">({
	children,
	className,
	element,
	size = "medium",
	...rest
}: TypographyProps<E>) => {
	const Element = element || "div";
	const sizeClasses = {
		default: "",
		"2xl": "text-2xl",
		"1.5xl": "text-1.5xl",
		xl: "text-xl",
		large: "text-lg",
		medium: "text-base",
		small: "text-sm",
	};

	const typographyClass = cn(sizeClasses[size], className);

	return (
		<Element className={typographyClass} {...rest}>
			{children}
		</Element>
	);
};
