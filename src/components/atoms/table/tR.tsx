import React from "react";

import { cn } from "@utils";

interface ITR {
	color?: "gray";
	className?: string;
	children: React.ReactNode;
}

export const TR = ({ className, color, children }: ITR) => {
	const tRStyle = cn(
		"flex border-b border-gray-600 last:border-b-0 transition hover:bg-gray-800",
		{ "bg-gray-800": color === "gray" },
		className
	);

	return (
		<div role="row" className={tRStyle}>
			{children}
		</div>
	);
};
