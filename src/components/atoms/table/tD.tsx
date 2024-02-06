import React from "react";
import { ITable } from "@interfaces/components";
import { cn } from "@utilities";

export const Td = ({ className, children }: ITable) => {
	const tdStyle = cn(
		"w-full overflow-hidden flex items-center p-2.5 border-r border-gray-600 last:border-r-0",
		className
	);

	return (
		<div className={tdStyle} role="cell">
			<div className="truncate">{children}</div>
		</div>
	);
};
