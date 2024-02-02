import React, { ReactNode } from "react";
import { cn } from "@utils";

interface ITR {
	color?: "gray";
	className?: string;
	children: ReactNode;
}

export const Tr = ({ className, color, children }: ITR) => {
	const tRStyle = cn(
		"flex border-b border-gray-600 last:border-b-0 transition hover:bg-black",
		{ "bg-gray-800": color === "gray" },
		className
	);

	return (
		<div className={tRStyle} role="row">
			{children}
		</div>
	);
};
