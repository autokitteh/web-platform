import React from "react";
import { cn } from "@utils";

interface IThead {
	className?: string;
	children: React.ReactNode;
}

export const THead = ({ className, children }: IThead) => {
	const headStyle = cn("sticky z-10 top-0 bg-black text-gray-300 rounded-t", className);

	return (
		<div className={headStyle} role="rowgroup">
			{children}
		</div>
	);
};
