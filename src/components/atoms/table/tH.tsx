import React from "react";
import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Th = ({ className, children, onClick }: TableProps) => {
	const thStyle = cn("w-full truncate flex items-center gap-1 px-4 h-38", className);

	return (
		<th className={thStyle} onClick={onClick}>
			{children}
		</th>
	);
};
