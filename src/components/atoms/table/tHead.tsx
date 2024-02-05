import React from "react";
import { ITable } from "@interfaces";
import { cn } from "@utilities";

export const THead = ({ className, children }: ITable) => {
	const headStyle = cn("sticky z-10 top-0 bg-black text-gray-300 rounded-t", className);

	return (
		<div className={headStyle} role="rowgroup">
			{children}
		</div>
	);
};
