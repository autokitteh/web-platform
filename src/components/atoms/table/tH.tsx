import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";
import React from "react";

export const Th = ({ children, className, onClick }: TableProps) => {
	const thStyle = cn("w-full truncate flex items-center gap-1 px-4 h-9.5", className);

	return (
		<th className={thStyle} onClick={onClick}>
			{children}
		</th>
	);
};
