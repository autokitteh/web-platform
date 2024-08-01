import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Tr = ({ children, className, onClick, style, variant }: TableProps) => {
	const tRStyle = cn(
		"flex border-b-2 border-gray-1050 transition hover:bg-gray-1250",
		{
			"hover:bg-transparent": variant === "light",
		},
		className
	);

	return (
		<tr className={tRStyle} onClick={onClick} style={style}>
			{children}
		</tr>
	);
};
