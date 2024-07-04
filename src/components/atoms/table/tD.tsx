import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";
import React from "react";

export const Td = ({ children, className, onClick }: TableProps) => {
	const tdStyle = cn("w-full overflow-hidden flex items-center px-4 h-9.5", className);

	return (
		<td className={tdStyle} onClick={onClick}>
			<div className="truncate">{children}</div>
		</td>
	);
};
