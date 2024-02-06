import React from "react";
import { IBadge } from "@interfaces/components";
import { cn } from "@utilities";

export const Badge = ({ text, className }: IBadge) => {
	const badgeClasses = cn(
		"inline-block px-1 py-0.5 text-xs font-bold bg-red-500 text-black",
		"leading-none text-center align-baseline whitespace-nowrap rounded-full",
		className
	);

	return <span className={badgeClasses}>{text}</span>;
};
