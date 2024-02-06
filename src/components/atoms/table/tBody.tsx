import React from "react";
import { ITable } from "@interfaces/components";
import { cn } from "@utilities";

export const TBody = ({ className, children }: ITable) => {
	const bodyStyle = cn("border-t border-gray-600", className);

	return (
		<div className={bodyStyle} role="rowgroup">
			{children}
		</div>
	);
};
