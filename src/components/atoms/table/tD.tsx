import React from "react";

import { cn } from "@utils";

interface ITD {
	className?: string;
	children?: React.ReactNode;
}

export const TD = ({ className, children }: ITD) => {
	const tdStyle = cn("w-full flex items-center p-2.5 text-base border-r border-gray-600 last:border-r-0", className);

	return (
		<div role="cell" className={tdStyle}>
			{children}
		</div>
	);
};
