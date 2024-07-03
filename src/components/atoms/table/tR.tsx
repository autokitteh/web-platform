import React from "react";
import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Tr = ({ className, children, onClick, style }: TableProps) => {
	const tRStyle = cn("flex border-b-2 border-gray-600 transition hover:bg-gray-800", className);

	return (
		<tr className={tRStyle} onClick={onClick} style={style}>
			{children}
		</tr>
	);
};
