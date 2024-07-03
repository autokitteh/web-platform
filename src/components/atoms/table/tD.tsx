import React from "react";
import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Td = ({ className, children, onClick }: TableProps) => {
	const tdStyle = cn("w-full overflow-hidden flex items-center px-4 h-38", className);

	return (
		<td className={tdStyle} onClick={onClick}>
			<div className="truncate">{children}</div>
		</td>
	);
};
