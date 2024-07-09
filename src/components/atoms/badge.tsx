import React from "react";

import { BadgeProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Badge = ({ children, className }: BadgeProps) => {
	const badgeClasses = cn(
		"inline-block bg-red px-1 py-0.5 text-xs font-bold text-black",
		"whitespace-nowrap rounded-full text-center align-baseline leading-none",
		className
	);

	return <span className={badgeClasses}>{children}</span>;
};
