import React, { ReactNode } from "react";
import { cn } from "@utils";

interface ITR {
	className?: string;
	children: ReactNode;
}

export const Tr = ({ className, children }: ITR) => {
	const tRStyle = cn("flex border-b border-gray-600 last:border-b-0 transition hover:bg-black", className);

	return (
		<div className={tRStyle} role="row">
			{children}
		</div>
	);
};
