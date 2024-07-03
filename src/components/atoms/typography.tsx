import React, { ElementType } from "react";
import { TypographyProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Typography = <E extends ElementType = "div">({
	element,
	children,
	className,
	size = "medium",
	...rest
}: TypographyProps<E>) => {
	const Element = element || "div";
	const sizeClasses = {
		small: "text-sm",
		medium: "text-base",
		large: "text-lg",
	};

	const typographyClass = cn(sizeClasses[size], className);

	return (
		<Element className={typographyClass} {...rest}>
			{children}
		</Element>
	);
};
