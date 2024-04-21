import React from "react";
import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Th = ({ className, children, onClick }: TableProps) => {
	const thStyle = cn(
		"w-full truncate flex items-center gap-1 p-2.5 text-base border-r border-gray-600 last:border-r-0",
		className
	);

	return (
		<th className={thStyle} onClick={onClick}>
			{children}
		</th>
	);
};
