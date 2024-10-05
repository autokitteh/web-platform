import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

import { useTableVariant } from "@components/atoms/table";

export const Tr = ({ children, className, style }: TableProps) => {
	const { variant } = useTableVariant();
	const tRStyle = cn(
		"flex border-b-2 border-gray-1050 transition hover:bg-gray-1250",
		{
			"hover:bg-transparent": variant === "light",
		},
		className
	);

	return (
		<div className={tRStyle} role="rowgroup" style={style}>
			{children}
		</div>
	);
};
