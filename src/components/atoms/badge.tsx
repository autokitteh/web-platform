import React from "react";

import { BadgeProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Badge = ({ children, className }: BadgeProps) => {
	const badgeClasses = cn(
		"absolute bottom-0 inline-block h-2 w-2 bg-red p-1 text-xs font-bold text-black",
		"whitespace-nowrap rounded-full text-center align-baseline leading-none",
		{ "h-auto w-auto": !!children },
		className
	);

	return <div className={badgeClasses}>{children}</div>;
};
