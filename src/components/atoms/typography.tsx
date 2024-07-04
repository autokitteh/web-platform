import { TypographyProps } from "@interfaces/components";
import { cn } from "@utilities";
import React, { ElementType } from "react";

export const Typography = <E extends ElementType = "div">({
	children,
	className,
	element,
	size = "medium",
	...rest
}: TypographyProps<E>) => {
	const Element = element || "div";
	const sizeClasses = {
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
