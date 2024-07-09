import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Th = ({ children, className, onClick }: TableProps) => {
	const thStyle = cn("flex h-9.5 w-full items-center gap-1 truncate px-4", className);

	return (
		<th className={thStyle} onClick={onClick}>
			{children}
		</th>
	);
};
