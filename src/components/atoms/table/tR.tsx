import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";
import React from "react";

export const Tr = ({ children, className, onClick, style }: TableProps) => {
	const tRStyle = cn("flex border-b-2 border-gray-600 transition hover:bg-gray-800", className);

	return (
		<tr className={tRStyle} onClick={onClick} style={style}>
			{children}
		</tr>
	);
};
