import { BadgeProps } from "@interfaces/components";
import { cn } from "@utilities";
import React from "react";

export const Badge = ({ children, className }: BadgeProps) => {
	const badgeClasses = cn(
		"inline-block px-1 py-0.5 text-xs font-bold bg-red text-black",
		"leading-none text-center align-baseline whitespace-nowrap rounded-full",
		className
	);

	return <span className={badgeClasses}>{children}</span>;
};
