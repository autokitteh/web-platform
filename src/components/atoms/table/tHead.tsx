import React from "react";

import { cn } from "@utils";

interface IThead {
	className?: string;
	children: React.ReactNode;
}

export const THead = ({ className, children }: IThead) => {
	const headStyle = cn("bg-black text-gray-300", className);

	return (
		<div role="rowgroup" className={headStyle}>
			{children}
		</div>
	);
};
