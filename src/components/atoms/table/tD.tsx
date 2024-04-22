import React from "react";
import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Td = ({ className, children, onClick }: TableProps) => {
	const tdStyle = cn(
		"w-full overflow-hidden flex items-center p-2.5 border-r border-gray-600 last:border-r-0",
		className
	);

	return (
		<td className={tdStyle} onClick={onClick}>
			<div className="truncate">{children}</div>
		</td>
	);
};
