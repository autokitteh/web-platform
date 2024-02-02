import React from "react";

import { cn } from "@utils";

interface ITH {
	rightIcon?: React.ReactNode;
	className?: string;
	children?: React.ReactNode;
}

export const TH = ({ className, rightIcon, children }: ITH) => {
	const thStyle = cn(
		"w-full flex items-center gap-1 p-2.5 text-base border-r border-gray-600 last:border-r-0",
		className
	);

	return (
		<div role="columnheader" className={thStyle}>
			{children}
			{rightIcon}
		</div>
	);
};
