import React from "react";
import { cn } from "@utils";

interface ITH {
	className?: string;
	children?: React.ReactNode;
}

export const Th = ({ className, children }: ITH) => {
	const thStyle = cn(
		"w-full truncate flex items-center gap-1 p-2.5 text-base border-r border-gray-600 last:border-r-0",
		className
	);

	return (
		<div className={thStyle} role="columnheader">
			{children}
		</div>
	);
};
